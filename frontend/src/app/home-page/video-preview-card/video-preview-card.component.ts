import { NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { StringFormat } from '../../shared/utils/string-format';
import { VideoPreview } from '../../schemas/video-preview.schema';

@Component({
  selector: 'app-video-preview-card',
  standalone: true,
  imports: [NgFor, MatCardModule, MatIconModule],
  templateUrl: './video-preview-card.component.html',
  styleUrl: './video-preview-card.component.scss',
})
export class VideoPreviewCardComponent implements OnInit {
  @Input({ required: true }) video!: VideoPreview;
  timeSinceUpload: string = '1h';

  ngOnInit(): void {
    this.timeSinceUpload = StringFormat.getTimeSinceString(
      this.video.uploadDate
    );
  }
}
