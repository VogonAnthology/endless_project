import { Module } from '@nestjs/common';
import { OnetubeVideoService } from './onetube-video.service';
import { OnetubeVideo } from 'src/entities/onetube-video.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from 'src/entities/like.entity';
import { OnetubeVideoController } from './onetube-video.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OnetubeVideo, Like])],
  providers: [OnetubeVideoService],
  exports: [OnetubeVideoService],
  controllers: [OnetubeVideoController],
})
export class OnetubeVideoModule {}
