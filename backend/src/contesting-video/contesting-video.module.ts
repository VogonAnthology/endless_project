import { Module } from '@nestjs/common';
import { ContestingVideoService } from './contesting-video.service';
import { ContestingVideoController } from './contesting-video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContestingVideo } from 'src/entities/contesting-video.entity';
import { Contest } from 'src/entities/contest.entity';
import { ContestsModule } from 'src/contests/contests.module';
import { OnetubeVideoModule } from 'src/onetube-video/onetube-video.module';
import { VoteModule } from 'src/vote/vote.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContestingVideo, Contest]),
    ContestsModule,
    OnetubeVideoModule,
    VoteModule,
  ],
  providers: [ContestingVideoService],
  controllers: [ContestingVideoController],
})
export class ContestingVideoModule {}
