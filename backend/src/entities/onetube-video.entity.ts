import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContestingVideo } from './contesting-video.entity';
import { Like } from './like.entity';

@Entity()
export class OnetubeVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  startTimePoint: number;

  @Column()
  endTimePoint: number;

  @Column()
  duration: number;

  @Column()
  fileName: string;

  @OneToOne(() => ContestingVideo, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn()
  contestingVideo: ContestingVideo;

  @OneToMany(() => Like, (like) => like.onetubeVideo, { eager: false })
  likes: Like[];

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  viewCount: number;
}
