import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContestDto } from 'src/dto/contest.dto';
import { Contest } from 'src/entities/contest.entity';
import { ContestingVideo } from 'src/entities/contesting-video.entity';
import { ContestState } from 'src/enums/contest-state.enum';
import { ContestingVideoState } from 'src/enums/contesting-video-state.enum';
import { VoteService } from 'src/vote/vote.service';
import { Repository } from 'typeorm';

@Injectable()
export class ContestsService {
  constructor(
    @InjectRepository(Contest) private contestRepo: Repository<Contest>,
    private voteService: VoteService,
  ) {}

  createBlankContest(): Contest {
    const contest = new Contest();

    return contest;
  }

  async saveContest(contest: Contest): Promise<Contest> {
    return await this.contestRepo.save(contest);
  }

  async findContestByState(state: ContestState): Promise<Contest[]> {
    return await this.contestRepo.find({
      where: { state: state },
    });
  }

  async getContestDTO(id: number, userId?: number): Promise<ContestDto> {
    const contest = await this.find(id);
    if (!contest) {
      throw new Error('Contest not found : ' + id);
    }

    let showVoteCounts = false;

    if (contest.state !== ContestState.ON_GOING) {
      showVoteCounts = true;
    } else if (userId) {
      showVoteCounts = await this.voteService.didUserAlreadyVote(
        userId,
        contest.id,
      );
    }

    const contestingVideos = await contest.contestingVideos;
    const contestingVideosDTO = contestingVideos.map((video) => {
      return video.toDTO(showVoteCounts);
    });

    const contestDTO = contest.toDTO();
    contestDTO.contestingVideos = contestingVideosDTO;
    return contestDTO;
  }

  async find(id: number): Promise<Contest> {
    if (id != -1) {
      return await this.contestRepo.findOne({ where: { id: id } });
    }
    return await this.contestRepo.findOne({
      where: { state: ContestState.ON_GOING },
    });
  }

  async determineContestWinner(
    contest: Contest,
    contestingVideos: ContestingVideo[],
  ): Promise<void> {
    let winner = contestingVideos[0];

    for (let i = 1; i < contestingVideos.length; i++) {
      if (winner.votesCount < contestingVideos[i].votesCount) {
        winner = contestingVideos[i];
      }
    }
    //TODO : Add multiple winners possibility if tie
    winner.state = ContestingVideoState.PUBLISHED;
    contest.winner = winner;
  }
}
