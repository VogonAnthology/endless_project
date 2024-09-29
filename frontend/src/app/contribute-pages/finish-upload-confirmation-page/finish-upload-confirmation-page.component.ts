import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  UploadedVideoService,
  UploadingVideo,
} from '../../services/uploading-video/video.service';
import { VjsPlayerComponent } from '../../vjs-player/vjs-player.component';
import { HttpService } from '../../services/http.service';
import { StringFormat } from '../../shared/utils/string-format';
import { DateFormat } from '../../shared/utils/date-format';

@Component({
  selector: 'app-finish-upload-confirmation-page',
  standalone: true,
  imports: [VjsPlayerComponent],
  templateUrl: './finish-upload-confirmation-page.component.html',
  styleUrl: './finish-upload-confirmation-page.component.scss',
})
export class FinishUploadConfirmationPageComponent {
  @ViewChild('videoPlayer', { static: true }) videoPlayer!: ElementRef;
  video: UploadingVideo | null = null;
  videoUrl: string;
  title?: string;
  nextVotingStartDayString: string;
  nextVotingEndDayString: string;
  currentPrice: number = 1;
  constructor(
    private httpService: HttpService,
    private videoService: UploadedVideoService
  ) {
    const nextMonday = DateFormat.getNextWeekdayDate(1);
    const nextSunday = new Date();
    nextSunday.setDate(nextMonday.getDate() + 6);
    this.nextVotingStartDayString = nextMonday.toDateString();
    this.nextVotingEndDayString = nextSunday.toDateString();
    const video = this.videoService.getVideo();
    if (video) {
      this.video = video;
      this.videoUrl = URL.createObjectURL(video.videoBlob);
    } else {
      this.videoUrl = 'http://localhost:3000/hls/output.m3u8';
      this.title = 'Test Video';
      new Promise((resolve) => {
        setTimeout(() => {
          this.title = 'Test Video';
          console.log('Video loaded');
        }, 1000);
      });
    }
  }

  uploadVideo() {
    if (this.video) {
      this.httpService
        .postVideo(this.video.plan, this.video.videoBlob)
        .subscribe(() => {
          console.log('Video uploaded successfully');
        });
    }
  }
}
