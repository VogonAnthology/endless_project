import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { createTitleBar, TitleBar } from './custom-components';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

// Custom Title Component

@Component({
  selector: 'app-vjs-player',
  standalone: true,
  templateUrl: './vjs-player.component.html',
  styleUrl: './vjs-player.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: { ngSkipHydration: 'true' },
})
export class VjsPlayerComponent implements OnDestroy, AfterViewInit {
  @ViewChild('target', { static: true })
  target!: ElementRef;

  @Input() aspectRatio: string = '16:9';
  @Input() controls: boolean = true;
  @Input() title?: string;
  @Input() autoplay: boolean = false;
  @Input() sources: { src: string; type: string }[] = [];
  @Input() preload = 'metadata';
  @Input() onLoadedMetadata: (player: Player) => void | null = () => {};
  @Input() onPlay: (player: Player) => void | null = () => {};
  @Input() onPause: (player: Player) => void | null = () => {};
  @Input() onEnded: (player: Player) => void | null = () => {};
  @Input() onTimeUpdate: (player: Player) => void | null = () => {};
  @Input() manualInit: boolean = false;
  @Input() customPlayer: boolean = false;
  initialized = false;

  player!: Player;
  titleBar: TitleBar | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.manualInit) {
        this.initializePlayer();
      }
    }
  }

  public initializePlayer() {
    this.player = videojs(this.target.nativeElement, {
      aspectRatio: this.aspectRatio,
      controls: this.controls,
      autoplay: this.autoplay,
      preload: this.preload,
      sources: this.sources,
    });
    this.player.muted(true);
    this.addListeners();
    if (this.customPlayer) this.addCustomComponents();
  }

  private addListeners() {
    if (this.onLoadedMetadata)
      this.player.on('loadedmetadata', () => {
        this.initialized = true;
        this.onLoadedMetadata(this.player);
      });
    if (this.onPlay) this.player.on('play', () => this.onPlay(this.player));
    if (this.onPause) this.player.on('pause', () => this.onPause(this.player));
    if (this.onEnded) this.player.on('ended', () => this.onEnded(this.player));
    if (this.onTimeUpdate)
      this.player.on('timeupdate', () => {
        this.onTimeUpdate(this.player);
      });
  }

  private addCustomComponents() {
    this.titleBar = createTitleBar(this.player, {
      text: this.title,
    });
  }

  public play() {
    this.player.play();
  }

  public pause() {
    this.player.pause();
  }

  public setCurrentTime(time: number) {
    this.player.currentTime(time);
  }

  get currentTime() {
    return this.player.currentTime();
  }

  public muted(muted: boolean) {
    this.player.muted(muted);
  }

  get targetElement() {
    return this.target.nativeElement;
  }

  updateSources(newSources: { src: string; type: string }[]) {
    if (isPlatformBrowser(this.platformId)) {
      const pathPrefix =
        'http://localhost:3000/uploads/hls/playlists/contesting-videos/' +
        newSources[0].src +
        '/' +
        newSources[0].src +
        '.m3u8';
      newSources[0].src = pathPrefix;
      if (this.player) {
        this.player.src(newSources);
        this.player.load();
      }
    }
  }

  ngOnDestroy() {
    // Used timout to trigger after the end of slide animation
    setTimeout(() => {
      if (this.player) {
        this.player.dispose();
      }
    }, 1000);
  }
}
