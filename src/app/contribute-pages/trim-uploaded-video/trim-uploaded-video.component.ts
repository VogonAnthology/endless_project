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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-trim-uploaded-video',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    NgbTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './trim-uploaded-video.component.html',
  styleUrl: './trim-uploaded-video.component.scss',
  styles:
    '.tooltip-progress.tooltip-inner { background-color: #000; color: #fff; }',
})
export class TrimUploadedVideoComponent implements OnInit {
  @ViewChild('videoPlayer', { static: true }) videoPlayer!: ElementRef;
  @ViewChild('thumbnailTimeline', { static: true })
  thumbnailTimeline!: ElementRef;
  @ViewChild('thumbnailCanvas', { static: true })
  thumbnailCanvas!: ElementRef;
  @ViewChild('t', { static: true }) tooltip!: NgbTooltip;
  @ViewChild('progressBarPreview', { static: true })
  progressBarPreview!: ElementRef;
  @ViewChild('cbStart', { static: true }) cbStart!: ElementRef;
  @ViewChild('cbEnd', { static: true }) cbEnd!: ElementRef;
  @Input({ required: true }) videoFile!: File;
  private _plan!: string;
  private previousValue: Map<string, Map<string, any>> = new Map();
  isMuted: any;

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
  videoDuration: number = 0;
  sequenceDurationString: string = '0:00.00';
  startTime: number = 0;
  endTime: number = 0;
  startTimeString: string = '0:00';
  endTimeString: string = '0:00.00';
  isPlaying: boolean = false;
  ffmpeg = new FFmpeg();
  draggingHandle: 'start' | 'end' | 'progress' | null = null;
  displayProgressBarPreview: boolean = false;
  progressBarDisplayed: boolean = false;
  tooltipContent: string = '0:00';
  progressBarPreviewContent: string = '0:00';
  progressBarPreviewLeft: string = '0%';

  constructor(private videoService: VideoService, private router: Router) {
    this.previousValue.set(
      'start',
      new Map<string, any>([
        ['value', '00:00.00'],
        ['selectionStart', 0],
      ])
    );
    this.previousValue.set(
      'end',
      new Map<string, any>([
        ['value', '00:00.00'],
        ['selectionStart', 0],
      ])
    );
  }

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
      this.endTime = Math.min(this.videoDuration, this.maxSequenceDuration);
      this.endTimeString = StringFormat.getDurationToString(this.endTime, true);
      this.setSequenceDuration();
      this.generateThumbnails();
      this.tooltip.tooltipClass = 'tooltip-progress';
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
    this.tooltipContent = StringFormat.getDurationToString(
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
    return `${(this.startTime / this.videoDuration) * 100}%`;
  }

  get rightMaskWidth(): string {
    return `${(1 - this.endTime / this.videoDuration) * 100}%`;
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
    if (this.displayProgressBarPreview) this.showProgressBarPreview(event);
  }

  onHandleProgressMouseLeave() {
    this.hideProgressBarPreview();
  }

  onControlBarMouseOver() {
    this.hideProgressBarPreview();
    this.displayProgressBarPreview = false;
  }

  onControlBarMouseLeave(event: MouseEvent) {
    if (!this.draggingHandle) {
      this.showProgressBarPreview(event);
      this.displayProgressBarPreview = true;
    }
  }

  hideProgressBarPreview() {
    this.progressBarDisplayed = false;
    this.progressBarPreview.nativeElement.classList.remove('visible');
    this.progressBarPreview.nativeElement.classList.add('invisible');
  }

  showProgressBarPreview(event: MouseEvent) {
    this.progressBarDisplayed = true;
    this.onMouseMove(event);
    this.progressBarPreview.nativeElement.classList.remove('invisible');
    this.progressBarPreview.nativeElement.classList.add('visible');
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
    if (this.draggingHandle || this.progressBarDisplayed) {
      const rect = (
        this.thumbnailTimeline.nativeElement as HTMLCanvasElement
      ).getBoundingClientRect();
      const percentage = (event.clientX - rect.left) / rect.width;
      let newTime: number = percentage * this.videoDuration;

      if (this.draggingHandle) {
        if (this.draggingHandle === 'start') {
          this.cbEnd.nativeElement.classList.remove('active');
          this.cbStart.nativeElement.classList.add('active');
          this.setStartTime(newTime);
          this.updateVideoTime(this.startTime);
          this.setSequenceDuration();
        } else if (this.draggingHandle === 'end') {
          this.cbStart.nativeElement.classList.remove('active');
          this.cbEnd.nativeElement.classList.add('active');
          this.setEndTime(newTime);
          this.updateVideoTime(this.endTime);
          this.setSequenceDuration();
        } else if (this.draggingHandle === 'progress') {
          if (newTime < this.startTime) {
            this.setStartTime(newTime);
          } else if (newTime > this.endTime) {
            this.setEndTime(newTime);
          }
          this.updateVideoTime(newTime);
        }
      } else {
        this.progressBarPreviewContent =
          StringFormat.getDurationToString(newTime);
        this.progressBarPreviewLeft = `${percentage * 100}%`;
      }
    }
  }

  setSequenceDuration() {
    this.sequenceDurationString = StringFormat.getDurationToString(
      this.endTime - this.startTime
    );
  }

  setEndTime(newTime: number) {
    this.endTime = Math.max(newTime, this.startTime + 1);
    this.endTime = Math.min(this.endTime, this.videoDuration);
    if (this.endTime - this.startTime > this.maxSequenceDuration) {
      this.startTime = this.endTime - this.maxSequenceDuration;
      this.startTimeString = StringFormat.getDurationToString(
        this.startTime,
        true
      );
    }
    this.endTimeString = StringFormat.getDurationToString(this.endTime, true);
  }

  setStartTime(newTime: number) {
    this.startTime = Math.min(newTime, this.endTime - 1);
    this.startTime = Math.max(this.startTime, 0);
    if (this.endTime - this.startTime > this.maxSequenceDuration) {
      this.endTime = this.startTime + this.maxSequenceDuration;
      this.endTimeString = StringFormat.getDurationToString(this.endTime, true);
    }
    this.startTimeString = StringFormat.getDurationToString(
      this.startTime,
      true
    );
  }

  onBeforeInput(event: InputEvent, isStart: boolean): void {
    const key = isStart ? 'start' : 'end';
    const targetElement = event.target as HTMLInputElement;

    this.previousValue.get(key)!.set('value', targetElement.value);
    this.previousValue
      .get(key)!
      .set('selectionStart', targetElement.selectionStart ?? 0);
  }

  onInputChange(event: any, isStart: boolean): void {
    const previousValue = this.previousValue.get(isStart ? 'start' : 'end')!;
    let input = previousValue.get('value');
    let cursorPosition = previousValue.get('selectionStart');

    if (event.inputType === 'deleteContentBackward' && cursorPosition > 0) {
      let deletedChar: string;
      do {
        deletedChar = input[cursorPosition - 1];
        input =
          input.slice(0, cursorPosition - 1) + input.slice(cursorPosition);
        cursorPosition--;
      } while (!/^\d$/.test(deletedChar) && cursorPosition > 0);
    } else if (event.data) {
      const formattedPreviousValue = input.replace(/\D/g, '');
      console.log(formattedPreviousValue);
      console.log(formattedPreviousValue.length);
      if (formattedPreviousValue.length < 6) {
        while (cursorPosition > 0 && !/^\d$/.test(input[cursorPosition - 1])) {
          cursorPosition--;
        }
        input =
          input.slice(0, cursorPosition) +
          event.data +
          input.slice(
            input[cursorPosition] === '_' ? cursorPosition + 1 : cursorPosition
          );
        cursorPosition++;
        if (/[^(\d|_)]/.test(input[cursorPosition])) {
          console.log('here');
          cursorPosition++;
        }
      }
    }
    input = input.replace(/\D/g, '');

    if (input.length === 6) {
      const newTime = StringFormat.getDurationToNumber(input);
      if (isStart) {
        this.setStartTime(newTime);
      } else {
        this.setEndTime(newTime);
      }
      this.updateVideoTime(newTime);
      this.setSequenceDuration();
      input = StringFormat.getDurationToString(newTime, true);
    } else {
      if (input.length === 5) {
        input = `${input.slice(0, 2)}:${input.slice(2, 4)}.${input.slice(4)}_`;
      } else if (input.length === 4) {
        input = `${input.slice(0, 2)}:${input.slice(2, 4)}.__`;
      } else if (input.length === 3) {
        input = `${input.slice(0, 2)}:${input.slice(2)}_.__`;
      } else if (input.length === 2) {
        input = `${input}:__.__`;
      } else if (input.length === 1) {
        input = `${input}_:__.__`;
      } else {
        input = '__:__.__';
      }
    }

    event.target.value = input;
    event.target.selectionStart = cursorPosition;
    event.target.selectionEnd = cursorPosition;
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.draggingHandle = null;
    this.updateVideoTime(this.player.currentTime() ?? 0);
    this.displayProgressBarPreview = true;
    if (this.isMouseOverTimelineControlBar(event)) {
      this.showProgressBarPreview(event);
    }
  }

  isMouseOverTimelineControlBar(event: MouseEvent): boolean {
    const controlBarRect = (
      this.thumbnailTimeline.nativeElement as HTMLCanvasElement
    ).getBoundingClientRect();

    if (
      event.clientX >= controlBarRect.left &&
      event.clientX <= controlBarRect.right &&
      event.clientY >= controlBarRect.top &&
      event.clientY <= controlBarRect.bottom
    ) {
      return true;
    } else {
      return false;
    }
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

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.player.muted(this.isMuted);
  }

  async generateThumbnails() {
    const canvas = this.thumbnailCanvas.nativeElement;
    const context = canvas.getContext('2d');
    const videoElement = this.videoPlayer.nativeElement as HTMLVideoElement;

    //TODO: Adapter le nombre de miniatures à la taille de l'écran
    const thumbnailCount = 10;
    const interval = this.videoDuration / thumbnailCount;

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
      this.thumbnailTimeline.nativeElement as HTMLCanvasElement
    ).getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const newTime = percentage * this.videoDuration;
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
