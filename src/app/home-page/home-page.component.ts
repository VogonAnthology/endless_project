import { Component } from '@angular/core';
import { VideosExploreScrolldownComponent } from '../videos-explore-scrolldown/videos-explore-scrolldown.component';
import { VjsPlayerComponent } from '../vjs-player/vjs-player.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [VideosExploreScrolldownComponent, VjsPlayerComponent, RouterLink],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  videoDuration: number;
  contributorsCount: number;
  constructor() {
    this.videoDuration = 0;
    this.contributorsCount = 0;
  }
}
