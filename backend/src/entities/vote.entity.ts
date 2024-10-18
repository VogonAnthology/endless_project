import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ContestingVideo } from './contesting-video.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.votes)
  user: User;

  @ManyToOne(() => ContestingVideo, (contestingVideo) => contestingVideo.votes)
  contestingVideo: ContestingVideo;

  @Index()
  @Column()
  contestId: number;
}
