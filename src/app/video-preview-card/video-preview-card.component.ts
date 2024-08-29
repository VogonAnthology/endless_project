import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { VideoPreview } from '../schemas/video-preview.schema';

@Component({
  selector: 'app-video-preview-card',
  standalone: true,
  imports: [NgFor],
  templateUrl: './video-preview-card.component.html',
  styleUrl: './video-preview-card.component.scss',
})
export class VideoPreviewCardComponent {
  @Input({ required: true }) video!: VideoPreview;
}
