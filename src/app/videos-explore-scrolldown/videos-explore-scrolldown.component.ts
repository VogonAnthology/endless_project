import { Component } from '@angular/core';
import { VideoPreviewCardComponent } from '../video-preview-card/video-preview-card.component';
import { NgFor } from '@angular/common';
import { VideoPreview } from '../schemas/video-preview.schema';

@Component({
  selector: 'app-videos-explore-scrolldown',
  standalone: true,
  imports: [VideoPreviewCardComponent, NgFor],
  templateUrl: './videos-explore-scrolldown.component.html',
  styleUrl: './videos-explore-scrolldown.component.scss',
})
export class VideosExploreScrolldownComponent {
  videos: Array<VideoPreview> = [];

  constructor() {
    this.videos = [
      {
        thumbnail:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp5_q-suuIiXL4BGSvmxGwMuCbGtxQwf7-tQ&s',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        views: 100,
        link: 'https://example.com/video.mp4',
      },
      {
        thumbnail:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp5_q-suuIiXL4BGSvmxGwMuCbGtxQwf7-tQ&s',
        description: 'A video about something else',
        contributor: 'Bob',
        likes: 20,
        views: 200,
        link: 'https://example.com/video.mp4',
      },
      {
        thumbnail:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp5_q-suuIiXL4BGSvmxGwMuCbGtxQwf7-tQ&s',
        description: 'A video about something different',
        contributor: 'Charlie',
        likes: 30,
        views: 300,
        link: 'https://example.com/video.mp4',
      },
    ];
  }
}
