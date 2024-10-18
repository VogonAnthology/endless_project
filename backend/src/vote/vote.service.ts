import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vote } from 'src/entities/vote.entity';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepo: Repository<Vote>,
  ) {}

  async saveVote(vote: Vote, queryRunner?: QueryRunner): Promise<Vote> {
    if (queryRunner) {
      return await queryRunner.manager.save(vote);
    }
    return await this.voteRepo.save(vote);
  }

  async didUserAlreadyVote(
    userId: number,
    contestId: number,
  ): Promise<boolean> {
    const existingVoteForThisContest = await this.voteRepo.findOne({
      where: { user: { id: userId }, contestId: contestId },
    });

    return !!existingVoteForThisContest;
  }

  async findOne(args: any): Promise<Vote> {
    return await this.voteRepo.findOne(args);
  }
}
