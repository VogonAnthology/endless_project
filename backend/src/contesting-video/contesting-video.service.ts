import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import { join } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { ContestingVideo } from 'src/entities/contesting-video.entity';
import { QueryRunner, Repository } from 'typeorm';
import { ContestsService } from 'src/contests/contests.service';
import { User } from 'src/entities/user.entity';
import { ContestingVideoState } from 'src/enums/contesting-video-state.enum';
import { ContestState } from 'src/enums/contest-state.enum';
import { Contest } from 'src/entities/contest.entity';
import { Vote } from 'src/entities/vote.entity';
import { OnetubeVideoService } from 'src/onetube-video/onetube-video.service';
import { promises as fs } from 'fs';
import { VoteService } from 'src/vote/vote.service';
import { VoteCountUpdateDto } from './dto/vote-count-update.dto';

@Injectable()
export class ContestingVideoService {
  constructor(
    @InjectRepository(ContestingVideo)
    private contestingVideoRepo: Repository<ContestingVideo>,
    private contestService: ContestsService,
    private voteService: VoteService,
    private onetubeService: OnetubeVideoService,
  ) {}

  async voteForContestingVideo(
    videoId: number,
    userId: number,
  ): Promise<VoteCountUpdateDto> {
    const queryRunner =
      this.contestingVideoRepo.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const contestingVideo = await queryRunner.manager.findOne(
        ContestingVideo,
        {
          where: { id: videoId },
        },
      );

      if (!contestingVideo) {
        throw new Error('Contesting video not found.');
      }

      const contest = await contestingVideo.contest;

      if (process.env.NODE_ENV === 'production') {
        if (
          !this.isContestingVideoEligibleForVoting(contestingVideo, contest)
        ) {
          throw new Error('Contesting video is not eligible for voting.');
        }

        if (await this.voteService.didUserAlreadyVote(userId, contest.id)) {
          throw new Error('User is not eligible to vote.');
        }
      }

      const vote = new Vote();
      vote.user = { id: userId } as User;
      vote.contestId = contest.id;
      vote.contestingVideo = contestingVideo;
      await this.voteService.saveVote(vote, queryRunner);

      contestingVideo.votesCount++;
      await this.saveContestingVideo(contestingVideo, queryRunner);
      await queryRunner.commitTransaction();

      const voteCountUpdateDto = await this.getVoteCountUpdateDto(contest.id);
      return voteCountUpdateDto;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
  }
  async getVoteCountUpdateDto(contestId: number): Promise<VoteCountUpdateDto> {
    const contestingVideos = await this.contestingVideoRepo.find({
      where: { contest: { id: contestId } },
    });

    const voteCountUpdateDto: VoteCountUpdateDto = {};
    contestingVideos.forEach((video) => {
      voteCountUpdateDto[video.id] = video.votesCount;
    });
    console.log('Vote count update:', voteCountUpdateDto);
    return voteCountUpdateDto;
  }

  isContestingVideoEligibleForVoting(
    video: ContestingVideo,
    contest: Contest,
  ): boolean {
    return (
      video.state === ContestingVideoState.APPROVED &&
      contest.state === ContestState.ON_GOING
    );
  }

  async saveContestingVideo(
    contestingVideo: ContestingVideo,
    queryRunner?: QueryRunner,
  ): Promise<ContestingVideo> {
    if (queryRunner) {
      return await queryRunner.manager.save(contestingVideo);
    }
    return await this.contestingVideoRepo.save(contestingVideo);
  }

  async deleteActiveContestingVideoOfUser(userId: number): Promise<void> {
    const contestingVideos = await this.findContestingVideosByUserId(
      userId,
      true,
    );
    await this.contestingVideoRepo.remove(contestingVideos);
  }

  async findContestingVideosByUserId(
    userId: number,
    isActive: boolean = false,
  ): Promise<ContestingVideo[]> {
    return await this.contestingVideoRepo.find({
      where: { user: { id: userId }, isActive: isActive },
    });
  }

  async checkIfUserAlreadyHasContestingVideo(userId: number): Promise<boolean> {
    const contestingVideo = await this.findContestingVideosByUserId(
      userId,
      true,
    );
    return contestingVideo.length > 0;
  }

  async createEntityAndSave(
    userId: number,
    fileName: string,
    videoDuration: number,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      const contest = await this.contestService.findContestByState(
        ContestState.REGISTRATION_OPEN,
      );

      if (contest.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          await this.contestService.saveContest(
            this.contestService.createBlankContest(),
          );
        } else {
          throw new Error('No open contest found.');
        }
      } else if (contest.length > 1) {
        throw new Error('Multiple open contests found.');
      }

      const contestingVideo = new ContestingVideo();
      contestingVideo.user = { id: userId } as User;
      contestingVideo.fileName = fileName.split('.')[0].split('-')[1];
      contestingVideo.duration = videoDuration;
      contestingVideo.contest = Promise.resolve(contest[0]);

      await this.saveContestingVideo(contestingVideo, queryRunner);
    } catch (err) {
      throw new Error(err);
    }
  }

  async getVideoDuration(fileName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(
        join(__dirname, '../../uploads', fileName),
        (err, metadata) => {
          if (err) {
            reject(err);
          } else {
            resolve(metadata.format.duration);
          }
        },
      );
    });
  }

  async handleContestingVideoUpload(userId: number): Promise<void> {
    const contestingVideos = await this.findContestingVideosByUserId(
      userId,
      true,
    );

    if (contestingVideos.length === 0) {
      throw new Error('No formatted video found.');
    } else if (contestingVideos.length > 1) {
      throw new Error('Multiple formatted videos found.');
    }
    const videoId = contestingVideos[0].fileName;
    const uploadDir = join(__dirname, '../../uploads');
    const formattedVideoPath = join(
      uploadDir,
      'trimmed_and_formatted',
      'video-' + videoId + '.mp4',
    );

    const hlsDir = join(uploadDir, 'hls');
    const outputFolderPath = join(
      hlsDir,
      'playlists/contesting-videos',
      videoId,
    );
    const outputPlaylistFilePath = join(outputFolderPath, videoId + '.m3u8');

    try {
      ffmpeg.setFfmpegPath(ffmpegStatic);
      await this.createFolder(outputFolderPath);
      await this.convertToHLS(
        formattedVideoPath,
        outputFolderPath,
        outputPlaylistFilePath,
        videoId,
      );

      const updatedEntity = contestingVideos[0];
      updatedEntity.isConvertedToHls = true;
      updatedEntity.state = ContestingVideoState.WAITING_FOR_REVIEW;
      await this.saveContestingVideo(updatedEntity);

      if (process.env.NODE_ENV === 'development') {
        await this.onetubeService.publishVideo(updatedEntity);
      }
    } catch (err) {
      console.error('Error during video upload:', err);
    }
  }

  async createFolder(directoryPath: string): Promise<void> {
    try {
      await fs.mkdir(directoryPath, { recursive: true });
      console.log(`Directory created at: ${directoryPath}`);
    } catch (err) {
      console.error(`Error creating directory at ${directoryPath}:`, err);
      throw new Error(err);
    }
  }

  // Convert video to HLS format and save in hlsDir
  private convertToHLS(
    inputFilePath: string,
    outputDir: string,
    outputPlaylistDir: string,
    videoId: string,
  ): Promise<void> {
    const segmentName = `segment-${videoId}_%03d.ts`;

    return new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .outputOptions([
          '-c copy',
          '-hls_time 10',
          '-hls_playlist_type vod',
          '-hls_segment_filename',
          join(outputDir, segmentName),
        ])
        .output(outputPlaylistDir)
        .on('end', () => {
          console.log('HLS conversion completed.');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error during HLS conversion:', err);
          reject(err);
        })
        .run();
    });
  }

  async handleTrimAndConvertVideo(
    userId: number,
    outputFilename: string,
    outputFilePath: string,
    file: Express.Multer.File,
    body: { startTime: string; endTime: string },
    onProgress: (progress: number) => void,
  ): Promise<void> {
    const queryRunner =
      this.contestingVideoRepo.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const userAlreadyHasContestingVideo =
        await this.checkIfUserAlreadyHasContestingVideo(userId);

      if (userAlreadyHasContestingVideo) {
        if (process.env.NODE_ENV === 'production') {
          //TODO : redirect client to delete the current video or update it
          throw new Error('User already has a contesting video');
        } else {
          await this.deleteActiveContestingVideoOfUser(userId);
        }
      }
      const videoDuration = await this.trimAndConvertVideo(
        file.path,
        body.startTime,
        body.endTime,
        outputFilePath,
        onProgress,
      );
      await this.createEntityAndSave(
        userId,
        outputFilename,
        videoDuration,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
  }

  async trimAndConvertVideo(
    inputFile: string, // Path of the uploaded file
    startTime: string, // Start time for trimming
    endTime: string, // End time for trimming
    outputFile: string, // Output file path
    onProgress: (progress: number) => void, // Progress callback
  ): Promise<number> {
    ffmpeg.setFfmpegPath(ffmpegStatic);
    return new Promise((resolve, reject) => {
      let totalTime: number = parseFloat(endTime) - parseFloat(startTime);
      if (totalTime > 60) {
        const minutes = totalTime / 60;
        totalTime = minutes * 100 + (totalTime % 60);
      }
      ffmpeg(inputFile)
        .outputOptions([
          '-ss',
          startTime,
          '-to',
          endTime, // End time for the trim
          '-c:v',
          'libx264', // Video codec (H.264)
          '-crf',
          '18', // Quality level
          '-preset',
          'veryfast', // Speed/quality balance
          '-c:a',
          'aac', // Encode audio with AAC codec
          '-b:a',
          '192k', // Set audio bitrate to 192 kbps
          '-movflags',
          '+faststart', // Optimize for web streaming
        ])
        .on('progress', (progress) => {
          const time = parseInt(progress.timemark.replace(/:/g, ''));

          const percent = (time / totalTime) * 100;
          console.log(progress);
          console.log('totalTime :', totalTime);
          onProgress(Math.max(percent, 0)); // Call the progress callback
        })
        .on('end', () => {
          console.log('Processing finished.');
          resolve(totalTime);
        })
        .on('error', (err) => {
          console.error('Error during processing:', err);
          reject(err);
        })
        .save(outputFile);
    });
  }
}
