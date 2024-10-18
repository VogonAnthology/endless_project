import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  Sse,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { map, Observable, Subject } from 'rxjs';
import { createReadStream, unlinkSync } from 'fs';
import { ContestingVideoService } from './contesting-video.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { VoteCountUpdateDto } from './dto/vote-count-update.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/roles.enum';
@Controller('contesting-video')
export class ContestingVideoController {
  private progress$: Subject<number> = new Subject(); // For SSE progress updates

  constructor(private readonly videoService: ContestingVideoService) {}

  @Roles(Role.ADMIN, Role.USER)
  @Post('vote')
  async voteForVideo(
    @Body() body: { videoId: number },
    @Req() req,
  ): Promise<VoteCountUpdateDto> {
    const votes = await this.videoService.voteForContestingVideo(
      body.videoId,
      req.user.id,
    );
    console.log('Votes:', votes);
    return votes;
  }

  @Roles(Role.ADMIN, Role.USER)
  @Post('upload')
  async uploadVideo(@Req() req): Promise<void> {
    await this.videoService.handleContestingVideoUpload(req.user.id);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Post('trim-convert')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileExt = file.originalname.split('.').pop();
          const filename = `input_${Date.now() + '-' + Math.round(Math.random() * 1e5)}.${fileExt}`;
          cb(null, filename);
        },
      }),
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('video/')) {
          return callback(new Error('Only video files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async trimAndConvertVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { startTime: string; endTime: string },
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const outputFilename = `video-${Date.now() + Math.round(Math.random() * 1e5)}.mp4`; // Generate output file name
    const outputFilePath = join(
      __dirname,
      '../../uploads/trimmed_and_formatted',
      outputFilename,
    );

    try {
      await this.videoService.handleTrimAndConvertVideo(
        req.user.id,
        outputFilename,
        outputFilePath,
        file,
        body,
        (progress: number) => {
          this.progress$.next(progress);
        },
      );

      const videoStream = createReadStream(outputFilePath);

      res.set({
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${outputFilename}"`,
      });

      return new StreamableFile(videoStream);
    } finally {
      unlinkSync(file.path);
      // unlinkSync(outputFilePath); // Remove the processed file
    }
  }

  @Public()
  @Sse('progress')
  sendProgress(): Observable<MessageEvent> {
    return this.progress$.asObservable().pipe(
      map((progress: number) => {
        return new MessageEvent('progress', {
          data: { progress },
        });
      }),
    );
  }
}
