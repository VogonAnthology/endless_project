import { Component, ViewChild } from '@angular/core';
import { VjsPlayerComponent } from '../vjs-player/vjs-player.component';
import { ScrollContainerComponent } from '../shared/components/scroll-container/scroll-container.component';
import { ContestVideoPreviewCardComponent } from './contest-video-preview-card/contest-video-preview-card.component';
import { CommonModule } from '@angular/common';
import { VideoPreview } from '../schemas/video-preview.schema';
import { StaticProgressbarComponent } from '../shared/components/static-progressbar/static-progressbar.component';

@Component({
  selector: 'app-contest-page',
  standalone: true,
  imports: [
    VjsPlayerComponent,
    ScrollContainerComponent,
    ContestVideoPreviewCardComponent,
    CommonModule,
    StaticProgressbarComponent,
  ],
  templateUrl: './contest-page.component.html',
  styleUrl: './contest-page.component.scss',
})
export class ContestPageComponent {
  videos: Map<string, VideoPreview> = new Map();
  currentuuid: string = ''; // On utilise UUID plutôt qu'un index
  currentVideo!: VideoPreview; // La vidéo actuellement lue
  @ViewChild('playerComponent') playerComponent!: VjsPlayerComponent;

  // nextVideo() {
  //   this.currentVideoIndex++;
  // }

  // prevVideo() {
  //   this.currentVideoIndex--;
  // }

  constructor() {
    const videoArray = [
      {
        uuid: '1',
        thumbnail: 'https://picsum.photos/200/300',
        title: 'A video about something something or other',
        description: 'A video about something',
        contributor: 'Alice',
        likes: 10,
        uploadDate: new Date(),
        views: 100,
        link: 'https://www.w3schools.com/tags/mov_bbb.mp4',
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
        link: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
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
        link: 'https://www.w3schools.com/tags/mov_bbb.mp4',
        votes: 4,
        votePercent: 20,
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
        link: 'https://www.w3schools.com/tags/mov_bbb.mp4',
        votes: 2,
        votePercent: 10,
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
        link: 'https://www.w3schools.com/tags/mov_bbb.mp4',
        votes: 2,
        votePercent: 10,
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
        link: 'https://www.w3schools.com/tags/mov_bbb.mp4',
        votes: 2,
        votePercent: 10,
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
        link: 'https://www.w3schools.com/tags/mov_bbb.mp4',
        votes: 2,
        votePercent: 10,
      },
    ];

    videoArray.forEach((video) => {
      this.videos.set(video.uuid, video);
    });
    this.currentuuid = videoArray[0].uuid;
    this.currentVideo = videoArray[0];
  }

  // Méthode pour sélectionner une vidéo par son UUID
  selectVideoByUuid(uuid: string) {
    const selectedVideo = this.videos.get(uuid);
    console.log('Selected video:', uuid);
    if (selectedVideo) {
      this.currentuuid = uuid;
      this.currentVideo = selectedVideo;
      this.playerComponent.updateSources([
        { src: selectedVideo.link, type: 'video/mp4' },
      ]);
    }
  }

  // Obtenir la liste des vidéos à afficher (exclure la vidéo en cours)
  getFilteredVideos(): VideoPreview[] {
    return Array.from(this.videos.values()).filter(
      (video) => video.uuid !== this.currentuuid
    );
  }
}
