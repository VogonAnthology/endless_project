import {
  Component,
  ComponentRef,
  ElementRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { TrimUploadedVideoComponent } from '../trim-uploaded-video/trim-uploaded-video.component';
import { ChooseSubmitPlanPageComponent } from '../choose-submit-plan-page/choose-submit-plan-page.component';
import { MatIconModule } from '@angular/material/icon';
import { StringFormat } from '../../utils/string-format';

@Component({
  selector: 'app-upload-video-page',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './upload-video-page.component.html',
  styleUrl: './upload-video-page.component.scss',
})
export class UploadVideoPageComponent {
  @ViewChild('videoThumbnailCanvas')
  thumbnailCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('uploadContainer') uploadContainer!: ElementRef;
  @ViewChild('choosePlanContainer', { read: ViewContainerRef, static: true })
  choosePlanContainer!: ViewContainerRef;
  @ViewChild('trimContainer', { read: ViewContainerRef })
  trimContainer!: ViewContainerRef;
  trimContainerInitialized: boolean = false;
  planContainerInitialized: boolean = false;
  plan: string = '';
  file: File | null = null;
  fileDuration: string = '0:00';
  fileSizeFormatted: string = '';
  activeSections: number = 0;
  currentSection: number = 0;
  formProgress: number = 0;
  private trimComponentRef?: ComponentRef<TrimUploadedVideoComponent>;
  private choosePlanComponentRef?: ComponentRef<ChooseSubmitPlanPageComponent>;

  // ngAfterViewInit(): void {
  //   this.scrollContainer.nativeElement.addEventListener(
  //     'scroll',
  //     this.onScroll.bind(this)
  //   );
  // }

  // ngOnDestroy() {
  //   this.scrollContainer.nativeElement.addEventListener(
  //     'scroll',
  //     this.onScroll.bind(this)
  //   );
  // }

  // onScroll(): void {
  //   const sections = [
  //     this.uploadContainer.nativeElement,
  //     this.trimComponentRef?.location.nativeElement.parentElement,
  //     this.choosePlanComponentRef?.location.nativeElement.parentElement,
  //   ].filter((section) => !!section);
  //   let currentSection: string = '';

  //   sections.forEach((section) => {
  //     const sectionTop = section.getBoundingClientRect().top;
  //     console.log(section.getAttribute('id') + ': ' + sectionTop);
  //     if (sectionTop <= 56 && sectionTop > -section.clientHeight / 2) {
  //       currentSection = section.getAttribute('id') || '';
  //     }
  //   });

  //   if (currentSection) {
  //     this.activeSection = currentSection;
  //   }
  // }

  scrollTo(section: string) {
    const sectionElement = document.getElementById(section);
    this.currentSection = parseInt(section.charAt(section.length - 1));
    if (this.currentSection > this.activeSections) {
      this.activeSections = this.currentSection;
      this.formProgress = (this.activeSections / 2) * 100;
    }
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  //TODO : Player pour voir les vidéos précédentes
  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.file = file;
      this.updateOrInitializeChoosePlanComponent();
      await this.handleThumbnailView(file);
    }
  }

  private async generateThumbnail(file: File) {
    const canvas = this.thumbnailCanvas.nativeElement;
    const context = canvas.getContext('2d');
    const video = document.createElement('video');

    video.src = URL.createObjectURL(file);
    await this.loadVideo(video);

    this.fileDuration = StringFormat.getTimeToString(video.duration);
    this.fileSizeFormatted = StringFormat.formatBytes(file.size);

    canvas.width = video.videoWidth / 4;
    canvas.height = video.videoHeight / 4;

    await this.seekToTime(video, 0);

    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  private loadVideo(video: HTMLVideoElement): Promise<void> {
    return new Promise<void>((resolve) => {
      video.addEventListener('loadeddata', () => resolve());
    });
  }

  private seekToTime(
    videoElement: HTMLVideoElement,
    time: number
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      videoElement.currentTime = time;
      videoElement.onseeked = () => resolve();
    });
  }

  onUpload() {}

  onCancel() {
    this.file = null;
    this.destroyChoosePlanComponent();
    this.destroyTrimComponent();
    this.activeSections = 0;
    this.formProgress = 0;
  }

  commonDragEvents(event: DragEvent, classAction: number) {
    event.preventDefault();
    event.stopPropagation();
    const dragDropArea = event.currentTarget as HTMLElement;
    if (classAction) {
      dragDropArea.classList.add('drag-over');
    } else {
      dragDropArea.classList.remove('drag-over');
    }
  }

  onDragOver(event: DragEvent) {
    this.commonDragEvents(event, 1);
  }

  onDragLeave(event: DragEvent) {
    this.commonDragEvents(event, 0);
  }

  async onDrop(event: DragEvent) {
    this.commonDragEvents(event, 0);

    if (event.dataTransfer?.files) {
      const file: File = event.dataTransfer.files[0];

      if (file) {
        this.file = file;
        this.updateOrInitializeChoosePlanComponent();
        await this.handleThumbnailView(file);
      }
    }
  }

  async handleThumbnailView(file: File): Promise<void> {
    if (this.thumbnailCanvas) {
      await this.generateThumbnail(file);
    } else {
      await new Promise(requestAnimationFrame);
      await this.handleThumbnailView(file);
    }
  }

  updateOrInitializeChoosePlanComponent() {
    if (!this.planContainerInitialized) {
      this.addChooseSubmitPlanComponent();
      this.planContainerInitialized = true;
    }
  }

  addChooseSubmitPlanComponent() {
    this.choosePlanContainer.clear();
    this.choosePlanComponentRef = this.choosePlanContainer.createComponent(
      ChooseSubmitPlanPageComponent
    );

    this.choosePlanComponentRef.instance.plan.subscribe((plan: string) => {
      this.plan = plan;
      this.updateOrInitializeTrimComponent();
    });
  }

  updateOrInitializeTrimComponent() {
    if (this.file && this.plan) {
      if (this.trimContainerInitialized && this.trimComponentRef) {
        this.trimComponentRef.instance.plan = this.plan;
      } else {
        this.addTrimUploadedVideoComponent(this.file, this.plan);
        this.trimContainerInitialized = true;
      }
    }
  }

  addTrimUploadedVideoComponent(file: File, plan: string) {
    this.trimComponentRef = this.trimContainer.createComponent(
      TrimUploadedVideoComponent
    );
    this.trimComponentRef.instance.videoFile = file;
    this.trimComponentRef.instance.plan = plan;
  }

  destroyTrimComponent() {
    this.trimComponentRef?.destroy();
    this.trimContainer.clear();
    this.trimContainerInitialized = false;
  }

  destroyChoosePlanComponent() {
    this.plan = '';
    this.choosePlanComponentRef?.destroy();
    this.choosePlanContainer.clear();
    this.planContainerInitialized = false;
  }
}
