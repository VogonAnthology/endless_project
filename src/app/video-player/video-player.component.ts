import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import videojs from 'video.js';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const videoElement = document.getElementById('my-video');
    if (videoElement) {
      videojs(videoElement, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        aspectRatio: '9:16',
        fill: true,
      });
    } else {
      console.error('Video element not found');
    }
  }
}
