import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { VideoPreviewCardComponent } from '../video-preview-card/video-preview-card.component';
import { VideoPreview } from '../../../schemas/video-preview.schema';

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
    const dateUploaded = new Date();
    dateUploaded.setDate(dateUploaded.getDate() - 1);
    this.videos = [
      {
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: dateUploaded,
        views: 100,
        link: 'https://example.com/video.mp4',
      },
      {
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: dateUploaded,
        views: 100,
        link: 'https://example.com/video.mp4',
      },
      {
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: dateUploaded,
        views: 100,
        link: 'https://example.com/video.mp4',
      },
      {
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: dateUploaded,
        views: 100,
        link: 'https://example.com/video.mp4',
      },
      {
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something else',
        description: '',
        contributor: 'Bob',
        likes: 20,
        uploadDate: dateUploaded,
        views: 200,
        link: 'https://example.com/video.mp4',
      },
      {
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: dateUploaded,
        views: 100,
        link: 'https://example.com/video.mp4',
      },
      {
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: dateUploaded,
        views: 100,
        link: 'https://example.com/video.mp4',
      },
      {
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something else',
        description: '',
        contributor: 'Bob',
        likes: 20,
        uploadDate: dateUploaded,
        views: 200,
        link: 'https://example.com/video.mp4',
      },
      {
        thumbnail: 'https://picsum.photos/200/300',
        description: 'A video about something different',
        title: 'A video about something different',
        contributor: 'Charlie',
        likes: 30,
        uploadDate: dateUploaded,
        views: 300,
        link: 'https://example.com/video.mp4',
      },
    ];
  }
}
