import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { ContestingVideo } from 'src/entities/contesting-video.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OnetubeVideo } from 'src/entities/onetube-video.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class OnetubeVideoService {
  private filePath = path.join(__dirname, 'totalVideoTime.json');

  constructor(
    @InjectRepository(OnetubeVideo)
    private onetubeVideoRepo: Repository<OnetubeVideo>,
  ) {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({ totalVideoTime: 0 }));
    }
  }

  getTotalVideoTime(): number {
    const data = fs.readFileSync(this.filePath, 'utf8');
    const { totalVideoTime } = JSON.parse(data);
    return totalVideoTime;
  }

  addVideoTime(duration: number): void {
    const totalVideoTime = this.getTotalVideoTime();
    fs.writeFileSync(
      this.filePath,
      JSON.stringify({ totalVideoTime: totalVideoTime + duration }),
    );
  }

  async publishVideo(video: ContestingVideo): Promise<void> {
    const queryRunner =
      this.onetubeVideoRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.createAndSaveOnetubeVideoEntity(video, queryRunner);
      this.appendToPlaylist(video.fileName);
      this.addVideoTime(video.duration);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async saveOnetubeVideo(
    video: OnetubeVideo,
    queryRunner: QueryRunner,
  ): Promise<OnetubeVideo> {
    return await queryRunner.manager.save(video);
  }

  async createAndSaveOnetubeVideoEntity(
    contestingVideo: ContestingVideo,
    queryRunner: QueryRunner,
  ): Promise<OnetubeVideo> {
    const onetubeVideo = new OnetubeVideo();
    onetubeVideo.contestingVideo = contestingVideo;
    onetubeVideo.title = contestingVideo.title;
    onetubeVideo.description = contestingVideo.description;
    onetubeVideo.startTimePoint = this.getTotalVideoTime();
    onetubeVideo.endTimePoint =
      onetubeVideo.startTimePoint + contestingVideo.duration;
    onetubeVideo.duration = contestingVideo.duration;
    onetubeVideo.fileName = contestingVideo.fileName;

    return await this.saveOnetubeVideo(onetubeVideo, queryRunner);
  }

  // Append new segments to the existing playlist
  private appendToPlaylist(videoId: string): void {
    const videoPlaylistPath = path.join(
      __dirname,
      '../../uploads/hls/playlists/contesting-videos',
      videoId,
      videoId + '.m3u8',
    );
    const onetubePlaylistPath = path.join(
      __dirname,
      '../../uploads/hls/playlists/onetube-videos/onetube.m3u8',
    );

    // Check if the video playlist file was created
    if (!fs.existsSync(videoPlaylistPath)) {
      throw new Error(`Playlist file not found at path: ${videoPlaylistPath}`);
    }

    // Read the new playlist content (from temp.m3u8)
    const newPlaylistContent = fs.readFileSync(videoPlaylistPath, 'utf8');
    const newSegments = this.extractSegments(newPlaylistContent, videoId);
    const hlsHeaders =
      '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:VOD\n';

    let existingPlaylist = '';

    if (fs.existsSync(onetubePlaylistPath)) {
      existingPlaylist = fs.readFileSync(onetubePlaylistPath, 'utf8');
      const existingLines = existingPlaylist.split('\n');
      if (existingLines.length > 4) {
        existingPlaylist = existingLines.slice(4).join('\n');
      } else {
        // If there are fewer than 4 lines, the existing playlist will become empty
        existingPlaylist = '#EXT-X-ENDLIST';
      }
    } else {
      // If no existing playlist, create a new one
      existingPlaylist = '#EXT-X-ENDLIST';
    }

    // Append new segments to the existing playlist
    const updatedPlaylist =
      hlsHeaders +
      newSegments +
      '#EXT-X-DISCONTINUITY-SEQUENCE\n' +
      existingPlaylist;

    // Write updated playlist back to the playlist file
    fs.writeFileSync(onetubePlaylistPath, updatedPlaylist, 'utf8');

    console.log('New segments appended to the playlist.');
  }

  // Extract only the segments from the temporary playlist (ignores other headers)
  private extractSegments(playlistContent: string, videoId: string): string {
    const lines = playlistContent.split('\n');
    let segmentLines = '';
    let inSegmentBlock = false;
    const segmentPrefixPath = '../contesting-videos/' + videoId + '/';
    lines.forEach((line) => {
      if (line.startsWith('#EXTINF')) {
        inSegmentBlock = true;
        segmentLines += line + '\n';
      }
      if (inSegmentBlock) {
        if (line.endsWith('.ts')) {
          segmentLines += segmentPrefixPath + line + '\n';
          inSegmentBlock = false;
        }
      }
    });

    return segmentLines;
  }
}
