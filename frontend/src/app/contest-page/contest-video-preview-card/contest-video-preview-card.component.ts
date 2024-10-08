import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VideoPreview } from '../../schemas/video-preview.schema';
import { StringFormat } from '../../shared/utils/string-format';
import { StaticProgressbarComponent } from '../../shared/components/static-progressbar/static-progressbar.component';

@Component({
  selector: 'app-contest-video-preview-card',
  standalone: true,
  imports: [StaticProgressbarComponent],
  templateUrl: './contest-video-preview-card.component.html',
  styleUrl: './contest-video-preview-card.component.scss',
})
export class ContestVideoPreviewCardComponent {
  @Input({ required: true }) video!: VideoPreview;
  timeSinceUpload: string = '1h';
  @Output() videoSelected = new EventEmitter<string>();

  onCardClick() {
    this.videoSelected.emit(this.video.uuid);
  }

  ngOnInit(): void {
    this.timeSinceUpload = StringFormat.getTimeSinceString(
      this.video.uploadDate
    );
  }
}
