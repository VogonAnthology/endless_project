import { Module } from '@nestjs/common';
import { ContestsService } from './contests.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contest } from 'src/entities/contest.entity';
import { ContestsController } from './contests.controller';
import { VoteModule } from 'src/vote/vote.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contest]), VoteModule],
  providers: [ContestsService],
  exports: [ContestsService],
  controllers: [ContestsController],
})
export class ContestsModule {}
