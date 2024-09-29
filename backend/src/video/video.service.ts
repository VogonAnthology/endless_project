import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class VideoService {
  async handleVideoUpload(
    plan: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const uploadDir = join(__dirname, '../../uploads');
    const hlsDir = join(uploadDir, 'hls');
    const videoId = file.filename.split('.')[0]; // Assuming unique filenames
    const inputFilePath = join(uploadDir, file.filename);
    const outputPlaylistPath = join(hlsDir, 'output.m3u8'); // The existing playlist
    const outputSegmentName = `segment_${videoId}_%03d.ts`; // Unique segment names

    ffmpeg.setFfmpegPath(ffmpegStatic);

    // Convert uploaded video to HLS
    await this.convertToHLS(inputFilePath, hlsDir, outputSegmentName);

    // Append new segments to the existing .m3u8 playlist
    this.appendToPlaylist(hlsDir, outputSegmentName, outputPlaylistPath);
  }

  // Convert video to HLS format and save in hlsDir
  private convertToHLS(
    inputFilePath: string,
    outputDir: string,
    segmentName: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .outputOptions([
          '-c copy',
          '-hls_time 10', // Segment length of 10 seconds
          '-hls_playlist_type vod', // Create a VOD playlist
          '-hls_segment_filename',
          join(outputDir, segmentName), // Output .ts segments
        ])
        .output(join(outputDir, 'temp.m3u8')) // Temporary playlist for the new segments
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

  // Append new segments to the existing playlist
  private appendToPlaylist(
    outputDir: string,
    segmentName: string,
    playlistPath: string,
  ): void {
    const tempPlaylistPath = join(outputDir, 'temp.m3u8');

    // Check if temp.m3u8 was created
    if (!fs.existsSync(tempPlaylistPath)) {
      throw new Error('Temporary playlist not created');
    }

    // Read the new playlist content (from temp.m3u8)
    const newPlaylistContent = fs.readFileSync(tempPlaylistPath, 'utf8');
    const newSegments = this.extractSegments(newPlaylistContent);

    // Read the existing playlist content
    let existingPlaylist = '';
    if (fs.existsSync(playlistPath)) {
      existingPlaylist = fs.readFileSync(playlistPath, 'utf8');
      // Remove the old #EXT-X-ENDLIST if it exists
      existingPlaylist = existingPlaylist.replace('#EXT-X-ENDLIST', '');
    } else {
      // If no existing playlist, create a new one
      existingPlaylist =
        '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n';
    }

    // Append new segments to the existing playlist
    const updatedPlaylist =
      existingPlaylist +
      newSegments +
      '#EXT-X-DISCONTINUITY-SEQUENCE\n#EXT-X-ENDLIST\n';

    // Write updated playlist back to the playlist file
    fs.writeFileSync(playlistPath, updatedPlaylist, 'utf8');

    // Clean up the temp playlist file
    fs.unlinkSync(tempPlaylistPath);

    console.log('New segments appended to the playlist.');
  }

  // Extract only the segments from the temporary playlist (ignores other headers)
  private extractSegments(playlistContent: string): string {
    const lines = playlistContent.split('\n');
    let segmentLines = '';
    let inSegmentBlock = false;

    lines.forEach((line) => {
      if (line.startsWith('#EXTINF')) {
        inSegmentBlock = true;
      }
      if (inSegmentBlock) {
        segmentLines += `${line}\n`;
        if (line.endsWith('.ts')) {
          inSegmentBlock = false; // Move out of segment block after reading the .ts file
        }
      }
    });

    return segmentLines;
  }

  async trimAndConvertVideo(
    inputFile: string, // Path of the uploaded file
    startTime: string, // Start time for trimming
    endTime: string, // End time for trimming
    outputFile: string, // Output file path
    onProgress: (progress: number) => void, // Progress callback
  ): Promise<void> {
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
          startTime, // Start time for the trim
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
          console.log(totalTime);
          onProgress(Math.max(percent, 0)); // Call the progress callback
        })
        .on('end', () => {
          console.log('Processing finished.');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error during processing:', err);
          reject(err);
        })
        .save(outputFile); // Save the output to the specified path
    });
  }
}
