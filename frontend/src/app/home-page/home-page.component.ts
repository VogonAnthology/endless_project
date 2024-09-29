import { Component } from '@angular/core';
import { VideosExploreScrolldownComponent } from '../shared/components/videos-explore-scrolldown/videos-explore-scrolldown.component';
import { VjsPlayerComponent } from '../vjs-player/vjs-player.component';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    VideosExploreScrolldownComponent,
    MatButtonModule,
    VjsPlayerComponent,
    RouterLink,
  ],
  styleUrl: './home-page.component.scss',
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  hours: number;
  minutes: number;
  seconds: number;
  contributorsCount: number;
  constructor() {
    this.hours = 2;
    this.minutes = 30;
    this.seconds = 15;
    this.contributorsCount = 392;
  }
}
