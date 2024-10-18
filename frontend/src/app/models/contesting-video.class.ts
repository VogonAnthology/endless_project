import { User } from './user.class';

export class ContestingVideo {
  id: number;
  title?: string;
  description?: string;
  fileName: string;
  votesCount?: number;
  votePercent?: number;
  isAlreadyPlayed: boolean = false;
  user?: User;

  constructor({
    id,
    title,
    description,
    fileName,
    votesCount,
    votePercent,
    user,
  }: {
    id: number;
    title?: string;
    description?: string;
    fileName: string;
    votesCount?: number;
    votePercent?: number;
    user?: User;
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.fileName = fileName;
    this.votesCount = votesCount;
    this.votePercent = votePercent;
    this.user = user;
  }

  public static fromJson(json: any, totalVotes?: number): ContestingVideo {
    let votePercent = 0;
    if (totalVotes) {
      votePercent = Math.round((json.votesCount / totalVotes) * 100);
    }
    return new ContestingVideo({
      id: json.id,
      title: json.title,
      description: json.description,
      fileName: json.fileName,
      votesCount: json.votesCount,
      votePercent: votePercent,
      user: json.user ? User.fromJson(json.user) : undefined,
    });
  }
}
