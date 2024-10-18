import {
  afterRender,
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ContestCacheService } from '../services/contest-cache.service';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  isLoggedIn$: boolean = false;
  contestLink: any[] = ['/contest', -1];
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private readonly contestCacheService: ContestCacheService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.checkStatus();
      this.authService.isLoggedIn().subscribe((isLoggedIn) => {
        console.log('isLoggedIn', isLoggedIn);
        this.isLoggedIn$ = isLoggedIn;
      });
    }
  }

  openLoginModal() {
    this.authService.openLoginModal();
  }

  logout() {
    this.authService.logout();
  }

  setCurrentContestLink() {
    console.log('setContestLink');
    const currentContestId = this.contestCacheService.getCurrentContestId();
    this.contestLink = ['/contest', currentContestId];
  }
}
