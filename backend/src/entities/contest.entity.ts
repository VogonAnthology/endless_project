import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ContestingVideo } from './contesting-video.entity';
import { ContestState } from 'src/enums/contest-state.enum';
import { ContestDto } from 'src/dto/contest.dto';

@Entity()
export class Contest {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(
    () => ContestingVideo,
    (contestingVideo) => contestingVideo.contest,
  )
  contestingVideos: Promise<ContestingVideo[]>;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  setDates() {
    const currentDate = new Date();
    this.startDate = new Date(currentDate);
    this.finishedDate = new Date(currentDate);
    this.startDate.setDate(currentDate.getDate() + 7);
    this.finishedDate.setDate(currentDate.getDate() + 14);
  }

  @Column()
  startDate: Date;

  @Column()
  finishedDate: Date;

  @Column({
    type: 'enum',
    enum: ContestState,
    default: ContestState.REGISTRATION_OPEN,
  })
  state: ContestState;

  @OneToOne(() => ContestingVideo, { nullable: true })
  @JoinColumn()
  winner: ContestingVideo;

  toDTO(): ContestDto {
    return {
      id: this.id,
      startDate: this.startDate,
      endDate: this.finishedDate,
      state: this.state,
      contestingVideos: [],
      winnerID: this.winner?.id,
    };
  }
}
