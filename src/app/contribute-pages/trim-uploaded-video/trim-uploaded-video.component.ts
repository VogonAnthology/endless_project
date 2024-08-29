import {
  Component,
  ElementRef,
  HostListener,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgbTooltip, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { VideoService } from '../../services/uploading-video/video.service';
import { StringFormat } from '../../utils/string-format';

@Component({
  selector: 'app-trim-uploaded-video',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule, NgbTooltipModule],
  templateUrl: './trim-uploaded-video.component.html',
  styleUrl: './trim-uploaded-video.component.scss',
})
export class TrimUploadedVideoComponent implements OnInit {
  @ViewChild('videoPlayer', { static: true }) videoPlayer!: ElementRef;
  @ViewChild('thumbnailCanvas', { static: true }) thumbnailCanvas!: ElementRef;
  @ViewChild('t', { static: true }) tooltip!: NgbTooltip;
  @ViewChild('progressBarPreview', { static: true })
  progressBarPreview!: ElementRef;
  @ViewChild('cbStart', { static: true }) cbStart!: ElementRef;
  @ViewChild('cbEnd', { static: true }) cbEnd!: ElementRef;
  @Input({ required: true }) videoFile!: File;
  private _plan!: string;

  @Input()
  set plan(value: string) {
    this._plan = value;
    this.handlePlanChange();
  }
  get plan(): string {
    return this._plan;
  }

  maxSequenceDuration!: number;

  player!: Player;
  sequenceDuration: number = 0;
  videoDuration: number = 0;
  startTime: number = 0;
  endTime: number = 0;
  startTimeString: string = '0:00';
  endTimeString: string = '0:00';
  isPlaying: boolean = false;
  ffmpeg = new FFmpeg();
  draggingHandle: 'start' | 'end' | 'progress' | null = null;
  displayProgressBarPreview: boolean = false;
  tooltipContent: string = '0:00';
  progressBarPreviewContent: string = '0:00';
  progressBarPreviewLeft: string = '0%';

  constructor(private videoService: VideoService, private router: Router) {}

  initVideoPlayer() {
    const videoUrl = URL.createObjectURL(this.videoFile);

    this.player = videojs(this.videoPlayer.nativeElement, {
      aspectRatio: '16:9',
      controls: false,
      preload: 'metadata',
      sources: [
        {
          src: videoUrl,
          type: this.videoFile.type,
        },
      ],
    });

    this.player.on('loadedmetadata', () => {
      this.videoDuration = this.player.duration() ?? 0;
      this.sequenceDuration = this.player.duration() ?? 0;
      this.endTime = Math.min(this.sequenceDuration, this.maxSequenceDuration);
      this.generateThumbnails();
      this.tooltip.open();
    });

    this.player.on('play', () => (this.isPlaying = true));
    this.player.on('pause', () => (this.isPlaying = false));
    this.player.on('timeupdate', () => this.timeUpdate());
  }

  handlePlanChange() {
    console.log('Plan changed', this.plan);
    if (this.plan === 'contest') {
      this.maxSequenceDuration = 20;
      this.setStartTime(this.startTime);
    } else if (this.plan === 'payment') {
      this.maxSequenceDuration = 60;
    }
  }

  ngOnInit() {
    this.handlePlanChange();
    this.initVideoPlayer();
  }

  updateTooltip() {
    this.tooltipContent = StringFormat.getTimeToString(
      this.player.currentTime() ?? 0
    );
  }

  timeUpdate() {
    this.checkCurrentTime();
    this.updateTooltip();
  }

  checkCurrentTime() {
    if ((this.player.currentTime() ?? -1) >= this.endTime) {
      this.player.currentTime(this.startTime);
    }
  }

  get leftMaskWidth(): string {
    return `${(this.startTime / this.sequenceDuration) * 100}%`;
  }

  get rightMaskWidth(): string {
    return `${(1 - this.endTime / this.sequenceDuration) * 100}%`;
  }

  get leftHandlePosition(): string {
    return this.leftMaskWidth;
  }

  get rightHandlePosition(): string {
    return this.rightMaskWidth;
  }

  get progressOutputLeft(): string {
    const progressPercentage =
      ((this.player.currentTime() ?? 1) / this.videoDuration) * 100;
    return `${progressPercentage}%`;
  }

  onHandleProgressMouseOver(event: MouseEvent) {
    if (this.draggingHandle === 'start' || this.draggingHandle === 'end') {
      return;
    }
    this.displayProgressBarPreview = true;
    this.progressBarPreview.nativeElement.classList.remove('invisible');
    this.progressBarPreview.nativeElement.classList.add('visible');
  }

  onHandleProgressMouseLeave() {
    this.displayProgressBarPreview = false;
    this.progressBarPreview.nativeElement.classList.remove('visible');
    this.progressBarPreview.nativeElement.classList.add('invisible');
  }

  onHandleProgressMouseDown(event: MouseEvent) {
    if (this.draggingHandle === 'start' || this.draggingHandle === 'end') {
      return;
    }
    this.draggingHandle = 'progress';
    this.onTimeLineClick(event);
  }

  onHandleMouseDown(event: MouseEvent, handle: 'start' | 'end') {
    event.preventDefault();
    this.draggingHandle = handle;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.draggingHandle || this.displayProgressBarPreview) {
      const rect = (
        this.thumbnailCanvas.nativeElement as HTMLCanvasElement
      ).getBoundingClientRect();
      const percentage = (event.clientX - rect.left) / rect.width;
      let newTime: number = percentage * this.sequenceDuration;

      if (this.draggingHandle) {
        this.progressBarPreview.nativeElement.classList.remove('visible');
        this.progressBarPreview.nativeElement.classList.add('invisible');
        if (this.draggingHandle === 'start') {
          this.cbEnd.nativeElement.classList.remove('active');
          this.cbStart.nativeElement.classList.add('active');
          this.setStartTime(newTime);
          this.updateVideoTime(this.startTime);
        } else if (this.draggingHandle === 'end') {
          this.cbStart.nativeElement.classList.remove('active');
          this.cbEnd.nativeElement.classList.add('active');
          this.setEndTime(newTime);
          this.updateVideoTime(this.endTime);
        } else if (this.draggingHandle === 'progress') {
          if (newTime < this.startTime) {
            this.setStartTime(newTime);
          } else if (newTime > this.endTime) {
            this.setEndTime(newTime);
          }
          this.updateVideoTime(newTime);
        }
      } else {
        this.progressBarPreviewContent = StringFormat.getTimeToString(newTime);
        this.progressBarPreviewLeft = `${percentage * 100}%`;
      }
    }
  }

  setEndTime(newTime: number) {
    this.endTime = Math.max(newTime, this.startTime + 1);
    this.endTime = Math.min(this.endTime, this.sequenceDuration);
    if (this.endTime - this.startTime > this.maxSequenceDuration) {
      this.startTime = this.endTime - this.maxSequenceDuration;
      this.startTimeString = StringFormat.getTimeToString(this.startTime);
    }
    this.endTimeString = StringFormat.getTimeToString(this.endTime);
  }

  setStartTime(newTime: number) {
    this.startTime = Math.min(newTime, this.endTime - 1);
    this.startTime = Math.max(this.startTime, 0);
    if (this.endTime - this.startTime > this.maxSequenceDuration) {
      this.endTime = this.startTime + this.maxSequenceDuration;
      this.endTimeString = StringFormat.getTimeToString(this.endTime);
    }
    this.startTimeString = StringFormat.getTimeToString(this.startTime);
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.draggingHandle = null;
    this.updateVideoTime(this.player.currentTime() ?? 0);
  }

  updateVideoTime(newTime: number) {
    this.player.currentTime(newTime);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }

  async generateThumbnails() {
    const canvas = this.thumbnailCanvas.nativeElement;
    const context = canvas.getContext('2d');
    const videoElement = this.videoPlayer.nativeElement as HTMLVideoElement;

    //TODO: Adapter le nombre de miniatures à la taille de l'écran
    const thumbnailCount = 10;
    const interval = this.sequenceDuration / thumbnailCount;

    for (let i = 0; i < thumbnailCount; i++) {
      await this.seekToTime(videoElement, i * interval);

      context.drawImage(
        videoElement,
        (canvas.width / thumbnailCount) * i,
        0,
        canvas.width / thumbnailCount,
        canvas.height
      );
    }
  }

  seekToTime(videoElement: HTMLVideoElement, time: number): Promise<void> {
    return new Promise<void>((resolve) => {
      videoElement.currentTime = time;
      videoElement.onseeked = () => resolve();
    });
  }

  onTimeLineClick(event: MouseEvent) {
    const rect = (
      this.thumbnailCanvas.nativeElement as HTMLCanvasElement
    ).getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const newTime = percentage * this.sequenceDuration;
    if (newTime < this.startTime) {
      this.setStartTime(newTime);
    } else if (newTime > this.endTime) {
      this.setEndTime(newTime);
    }
    this.player.currentTime(newTime);
  }

  async trimVideo() {
    console.log('Trimming video...');
    if (!this.ffmpeg.loaded) {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          'text/javascript'
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          'application/wasm'
        ),
        classWorkerURL: '/assets/ffmpeg/worker.js',
      });
    }
    console.log('FFmpeg loaded');
    const arrayBuffer = await this.videoFile.arrayBuffer();

    const uint8Array = new Uint8Array(arrayBuffer);
    await this.ffmpeg.writeFile('input.mp4', uint8Array);
    await this.ffmpeg.exec([
      '-i',
      'input.mp4',
      '-ss',
      `${this.startTime}`,
      '-to',
      `${this.endTime}`,
      '-c',
      'copy',
      'output.mp4',
    ]);
    const data = await this.ffmpeg.readFile('output.mp4');
    const videoBlob = new Blob([data], { type: 'video/mp4' });

    this.videoService.setVideoBlob(videoBlob);
    // this.router.navigate(['/submit-video-page']); //TODO : final submit-page
  }
}
