import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContestsService } from 'src/contests/contests.service';
import { ContestState } from 'src/enums/contest-state.enum';
import { OnetubeVideoService } from 'src/onetube-video/onetube-video.service';

@Injectable()
export class TaskSchedulerService {
  constructor(
    private contestService: ContestsService,
    private oneTubeService: OnetubeVideoService,
  ) {}

  @Cron('0 0 * * 1')
  async handleWeeklyCron() {
    try {
      await this.handleOnGoingContest();
      await this.handleRegistrationOpenContest();

      await this.contestService.saveContest(
        this.contestService.createBlankContest(),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async handleOnGoingContest() {
    const openContest = await this.contestService.findContestByState(
      ContestState.ON_GOING,
    );

    if (openContest.length === 0) {
      throw new Error('No open contest found');
    } else if (openContest.length > 1) {
      throw new Error('More than one contest is open');
    }
    const contest = openContest[0];
    const contestingVideos = await contest.contestingVideos;

    await this.contestService.determineContestWinner(contest, contestingVideos);
    contest.state = ContestState.FINISHED;
    await this.oneTubeService.publishVideo(contest.winner);

    await this.contestService.saveContest(contest);
  }

  async handleRegistrationOpenContest() {
    const openContest = await this.contestService.findContestByState(
      ContestState.REGISTRATION_OPEN,
    );

    if (openContest.length === 0) {
      throw new Error('No open contest found');
    } else if (openContest.length > 1) {
      throw new Error('More than one contest is open');
    }
    const contest = openContest[0];
    const contestingVideos = await contest.contestingVideos;

    contestingVideos.forEach((video) => {
      video.isActive = false;
    });

    contest.contestingVideos = Promise.resolve(contestingVideos);
    contest.state = ContestState.ON_GOING;
    await this.contestService.saveContest(contest);
  }
}
