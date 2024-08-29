import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

@Component({
  selector: 'app-vjs-player',
  standalone: true,
  template: `
    <video
      #target
      class="video-js"
      controls
      muted
      playsinline
      preload="none"
    ></video>
  `,
  encapsulation: ViewEncapsulation.None,
})
export class VjsPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('target', { static: true })
  target!: ElementRef;

  // See options: https://videojs.com/guides/options
  @Input({ required: true })
  options!: {
    aspectRatio: string;
    controls: boolean;
    autoplay: boolean;
    sources: {
      src: string;
      type: string;
    }[];
  };

  player: Player | undefined;

  constructor(private elementRef: ElementRef) {}

  // Instantiate a Video.js player OnInit
  ngOnInit() {
    this.player = videojs(
      this.target.nativeElement,
      this.options,
      function onPlayerReady() {
        console.log('onPlayerReady', this);
      }
    );
  }

  // Dispose the player OnDestroy
  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }
}
