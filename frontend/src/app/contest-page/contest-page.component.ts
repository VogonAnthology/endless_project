import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { VjsPlayerComponent } from '../vjs-player/vjs-player.component';
import { ScrollContainerComponent } from '../shared/components/scroll-container/scroll-container.component';
import { ContestVideoPreviewCardComponent } from './contest-video-preview-card/contest-video-preview-card.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StaticProgressbarComponent } from '../shared/components/static-progressbar/static-progressbar.component';
import { HttpService } from '../services/http.service';
import { Contest } from '../models/contest.class';
import { ContestState } from '../enums/contest-state.enum';
import { ContestingVideo } from '../models/contesting-video.class';
import { ContestCacheService } from '../services/contest-cache.service';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';

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
export class ContestPageComponent implements OnInit, AfterViewInit {
  contest: Contest = new Contest({
    id: -1,
    startDate: new Date(),
    endDate: new Date(),
    state: ContestState.ON_GOING,
    videos: new Map<number, ContestingVideo>(),
  });
  cacheSrc: any = null;
  currentVideo: ContestingVideo | null = null; // La vidéo actuellement lue
  filtredVideos: ContestingVideo[] = [];
  @ViewChild('playerComponent') playerComponent!: VjsPlayerComponent;

  // nextVideo() {
  //   this.currentVideoIndex++;
  // }

  // prevVideo() {
  //   this.currentVideoIndex--;
  // }
  ngAfterViewInit(): void {
    if (this.cacheSrc) {
      this.playerComponent.updateSources([this.cacheSrc]);
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.route.paramMap.subscribe((params) => {
        let contestId = params.get('id');
        if (!contestId) {
          contestId = '-1';
        }
        this.contestCacheService.loadContest(parseInt(contestId));
      });
      this.contestCacheService.observableUpdates().subscribe((contest) => {
        if (!contest || isEqual(contest, this.contest)) {
          return;
        }

        this.contest = contest;
        this.updateRouteWithContestId(contest.id);
        this.selectVideoByUuid(Array.from(contest.videos.keys())[0]);
      });
    }
  }

  async getContestVideos(contestId: number, videoId?: number) {
    this.contest = await this.contestCacheService.get(contestId);
    this.selectVideoByUuid(
      videoId ?? Array.from(this.contest.videos.keys())[0]
    );
    //TODO : handle error
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    protected route: ActivatedRoute,
    private router: Router,
    private readonly contestCacheService: ContestCacheService,
    private readonly httpService: HttpService,
    private readonly authService: AuthService
  ) {}

  // Méthode pour sélectionner une vidéo par son UUID
  selectVideoByUuid(id: number) {
    const selectedVideo = this.contest.videos.get(id);
    if (selectedVideo) {
      this.currentVideo = selectedVideo;
      this.getFilteredVideos();
      if (this.playerComponent) {
        this.playerComponent.updateSources([
          { src: selectedVideo.fileName, type: 'application/x-mpegURL' },
        ]);
      } else {
        this.cacheSrc = {
          src: selectedVideo.fileName,
          type: 'application/x-mpegURL',
        };
      }
    }
  }

  private updateRouteWithContestId(contestId: number): void {
    this.router.navigate(['../', contestId], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  // Obtenir la liste des vidéos à afficher (exclure la vidéo en cours)
  getFilteredVideos(): void {
    console.log('filtred videos');
    this.filtredVideos = Array.from(this.contest.videos.values()).filter(
      (video) => video.id !== this.currentVideo?.id
    );
  }

  async voteForVideo(videoId?: number) {
    if (!videoId) {
      return;
    }
    if (!this.authService.isLoggedIn()) {
      this.authService.openLoginModal();
      return;
    }
    const voteCountsUpdate = await this.httpService.voteForVideo(videoId);

    if (voteCountsUpdate) {
      this.contestCacheService.updateVoteCounts(
        this.contest.id,
        voteCountsUpdate
      );
      this.getContestVideos(this.contest.id, videoId);
    }
  }
}
