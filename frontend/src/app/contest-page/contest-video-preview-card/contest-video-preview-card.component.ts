import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StaticProgressbarComponent } from '../../shared/components/static-progressbar/static-progressbar.component';
import { ContestingVideo } from '../../models/contesting-video.class';

@Component({
  selector: 'app-contest-video-preview-card',
  standalone: true,
  imports: [StaticProgressbarComponent],
  templateUrl: './contest-video-preview-card.component.html',
  styleUrl: './contest-video-preview-card.component.scss',
})
export class ContestVideoPreviewCardComponent {
  @Input({ required: true }) video!: ContestingVideo;
  @Input({ required: true }) showVotes!: boolean;
  @Output() videoSelected = new EventEmitter<number>();

  onCardClick() {
    this.videoSelected.emit(this.video.id);
  }
}
