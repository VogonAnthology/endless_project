import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Contest } from '../models/contest.class';
import { VoteCountUpdateDto } from '../dtos/vote-count-update.dto';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ContestCacheService {
  private cache: Map<number, Contest> = new Map();
  private currentContestId: number | null = null;
  private observableUpdate: BehaviorSubject<Contest | null> =
    new BehaviorSubject<Contest | null>(null);

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService
  ) {}

  async loadContest(contestId: number) {
    this.currentContestId = contestId;
    if (this.authService.getStatusChecked()) {
      const contest = await this.get(contestId);
      this.forceUpdate(contest);
    } else {
      this.authService.isLoggedIn().subscribe(async (isLoggedIn) => {
        const contest = await this.get(this.currentContestId ?? -1, true);
        this.forceUpdate(contest);
      });
    }
  }

  set(contestId: number, value: any) {
    this.cache.set(contestId, value);
  }

  getCurrentContestId(): number {
    if (this.currentContestId) {
      return this.currentContestId;
    } else {
      return -1;
    }
  }

  forceUpdate(contest: Contest) {
    this.observableUpdate.next(contest);
  }

  observableUpdates(): Observable<Contest | null> {
    return this.observableUpdate.asObservable();
  }

  async get(contestId: number, refresh: boolean = false): Promise<any> {
    this.currentContestId = contestId;
    if (this.cache.has(contestId) && !refresh) {
      return this.cache.get(contestId);
    } else {
      const value = await this.httpService.getContestVideos(contestId);
      console.log('getContest : ', contestId, 'refresh :', refresh);
      const contest = Contest.fromJson(value);
      this.cache.set(contest.id, contest);
      return contest;
    }
  }

  updateVoteCounts(contestId: number, voteCountsUpdateDto: VoteCountUpdateDto) {
    const contest = this.cache.get(contestId);
    if (contest) {
      contest.updateVoteCounts(voteCountsUpdateDto);
      console.log('Updated contest:', contest);
    }
    console.log(voteCountsUpdateDto);
  }

  clear() {
    this.cache.clear();
  }
}
