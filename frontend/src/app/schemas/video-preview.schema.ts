export interface VideoPreview {
  uuid: string;
  uploadDate: Date;
  thumbnail: string;
  views: number;
  contributor: string;
  link: string;
  votes: number;
  title: string;
  description: string;
  fileName?: string;
  votesCount?: number;
  votePercent?: number;
  isPlayed?: boolean;
  likes?: number;
}
