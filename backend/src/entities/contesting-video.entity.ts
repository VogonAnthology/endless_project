import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contest } from './contest.entity';
import { User } from './user.entity';
import { Vote } from './vote.entity';
import { ContestingVideoState } from 'src/enums/contesting-video-state.enum';
import { ContestingVideoDTO } from 'src/dto/contesting-video.dto';

@Entity()
export class ContestingVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  fileName: string;

  @Column()
  duration: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ContestingVideoState,
    default: ContestingVideoState.NOT_SUBMITTED,
  })
  state: ContestingVideoState;

  @ManyToOne(() => Contest, (contest) => contest.contestingVideos)
  contest: Promise<Contest>;

  @ManyToOne(() => User, (user) => user.contestingVideos, { eager: false })
  user: User;

  @OneToMany(() => Vote, (vote) => vote.contestingVideo, { eager: false })
  votes: Vote[];

  @Column({ default: 0 })
  votesCount: number;

  @Column({ default: false })
  isConvertedToHls: boolean;

  @Column({ default: true })
  isActive: boolean;

  toDTO(sendVoteCount: boolean): ContestingVideoDTO {
    return {
      id: this.id,
      fileName: this.fileName,
      user: this.user ? this.user.toDTO() : null,
      title: this.title,
      votesCount: sendVoteCount ? this.votesCount : undefined,
      description: this.description,
    };
  }
}
