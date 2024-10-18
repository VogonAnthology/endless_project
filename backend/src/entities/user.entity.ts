import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/enums/roles.enum';
import { ContestingVideo } from './contesting-video.entity';
import { Vote } from './vote.entity';
import { Like } from './like.entity';
import { UserDTO } from 'src/dto/user.dto';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ nullable: true })
  hashedRefreshToken: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(() => ContestingVideo, (contestingVideo) => contestingVideo.user)
  contestingVideos: Promise<ContestingVideo[]>;

  @OneToMany(() => Vote, (vote) => vote.user, { eager: false })
  votes: Vote[];

  @OneToMany(() => Like, (like) => like.user, { eager: false })
  likes: Like[];

  toDTO(): UserDTO {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      avatarUrl: this.avatarUrl,
      role: this.role,
    };
  }
}
