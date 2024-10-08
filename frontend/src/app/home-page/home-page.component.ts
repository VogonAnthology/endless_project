import { Component } from '@angular/core';
import { VjsPlayerComponent } from '../vjs-player/vjs-player.component';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { VideoPreviewCardComponent } from './video-preview-card/video-preview-card.component';
import { ScrollContainerComponent } from '../shared/components/scroll-container/scroll-container.component';
import { CommonModule } from '@angular/common';
import { VideoPreview } from '../schemas/video-preview.schema';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatButtonModule,
    VjsPlayerComponent,
    RouterLink,
    VideoPreviewCardComponent,
    ScrollContainerComponent,
    CommonModule,
  ],
  styleUrl: './home-page.component.scss',
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  hours: number;
  minutes: number;
  seconds: number;
  contributorsCount: number;
  videos: Array<VideoPreview> = [];
  constructor() {
    this.hours = 2;
    this.minutes = 30;
    this.seconds = 15;
    this.contributorsCount = 392;

    const dateUploaded = new Date();
    dateUploaded.setDate(dateUploaded.getDate() - 1);
    this.videos = [
      {
        uuid: '1',
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: new Date(),
        views: 100,
        link: 'https://example.com/video.mp4',
        votes: 10,
        votePercent: 50,
        isPlayed: true,
      },
      {
        uuid: '2',
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: new Date(),
        views: 100,
        link: 'https://example.com/video.mp4',
        votes: 10,
      },
      {
        uuid: '3',
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: new Date(),
        views: 100,
        link: 'https://example.com/video.mp4',
        votes: 10,
      },
      {
        uuid: '4',
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: new Date(),
        views: 100,
        link: 'https://example.com/video.mp4',
        votes: 10,
      },
      {
        uuid: '5',
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: new Date(),
        views: 100,
        link: 'https://example.com/video.mp4',
        votes: 10,
      },
      {
        uuid: '6',
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: new Date(),
        views: 100,
        link: 'https://example.com/video.mp4',
        votes: 10,
      },
      {
        uuid: '7',
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: new Date(),
        views: 100,
        link: 'https://example.com/video.mp4',
        votes: 10,
      },
    ];
  }
}
