import {
  Body,
  Controller,
  Post,
  Res,
  Sse,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { map, Observable, Subject } from 'rxjs';
import { createReadStream, unlinkSync } from 'fs';

@Controller('video')
export class VideoController {
  private progress$: Subject<number> = new Subject(); // For SSE progress updates

  constructor(private readonly videoService: VideoService) {}

  // Endpoint to handle video upload
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `video-${uniqueSuffix}${ext}`;
          callback(null, filename);
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
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('plan') plan: string,
  ): Promise<void> {
    await this.videoService.handleVideoUpload(plan, file);
  }

  // Handle file upload, trim, and conversion
  @Post('trim-convert')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileExt = file.originalname.split('.').pop();
          const filename = `input_${Date.now()}.${fileExt}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async trimAndConvertVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { startTime: string; endTime: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const outputFilename = `output_${Date.now()}.mp4`; // Generate output file name
    const outputFilePath = join(__dirname, '../../uploads', outputFilename);

    try {
      // Call the VideoService to trim and convert the video
      await this.videoService.trimAndConvertVideo(
        file.path,
        body.startTime,
        body.endTime,
        outputFilePath,
        (progress) => {
          this.progress$.next(progress); // Send progress updates
        },
      );

      // Return the trimmed and converted video file
      const videoStream = createReadStream(outputFilePath);

      // Set headers for the video file response
      res.set({
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${outputFilename}"`,
      });

      // Return the file as a streamable response
      return new StreamableFile(videoStream);
    } finally {
      // Remove the temporary files after the request is complete
      unlinkSync(file.path); // Remove the original uploaded file
      // unlinkSync(outputFilePath); // Remove the processed file
    }
  }

  // Server-Sent Events endpoint for progress updates
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
