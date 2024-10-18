import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OnetubeVideo } from './onetube-video.entity';
import { User } from './user.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OnetubeVideo, (onetubeVideo) => onetubeVideo.likes)
  onetubeVideo: OnetubeVideo;

  @ManyToOne(() => User, (user) => user.likes)
  user: User;
}
