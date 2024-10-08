export interface VideoPreview {
  uuid: string;
  thumbnail: string;
  contributor: string;
  uploadDate: Date;
  views: number;
  link: string;
  title?: string;
  description?: string;
  likes?: number;
  votes?: number;
  votePercent?: number;
  isPlayed?: boolean;
}
