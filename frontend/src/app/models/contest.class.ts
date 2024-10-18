import { VoteCountUpdateDto } from '../dtos/vote-count-update.dto';
import { ContestState } from '../enums/contest-state.enum';
import { ContestingVideo } from './contesting-video.class';

export class Contest {
  id: number;
  startDate: Date;
  endDate: Date;
  state: ContestState;
  videos: Map<number, ContestingVideo>;
  winnerID?: number;
  showVotesToUser: boolean;

  constructor({
    id,
    startDate,
    endDate,
    state,
    videos,
    winnerID,
    showVotesToUser,
  }: {
    id: number;
    startDate: Date;
    endDate: Date;
    state: ContestState;
    videos: Map<number, ContestingVideo>;
    winnerID?: number;
    showVotesToUser?: boolean;
  }) {
    this.id = id;
    this.startDate = startDate;
    this.endDate = endDate;
    this.state = state;
    this.videos = videos;
    this.winnerID = winnerID;
    this.showVotesToUser = showVotesToUser || false;
  }

  public static fromJson(json: any): Contest {
    const contestingVideosMap = new Map<number, ContestingVideo>();
    let totalVotes: number | undefined = undefined;
    let showVotesToUser = false;

    if (
      json.contestingVideos.length > 0 &&
      json.contestingVideos[0].votesCount != undefined
    ) {
      totalVotes = json.contestingVideos.reduce(
        (acc: number, video: ContestingVideo) => acc + video.votesCount!,
        0
      );
      console.log('Total votes for contest ' + json.id + ' : ' + totalVotes);
      showVotesToUser = true;
    }

    json.contestingVideos.forEach((video: any) => {
      const contestingVideo = ContestingVideo.fromJson(video, totalVotes);
      contestingVideosMap.set(contestingVideo.id, contestingVideo);
    });

    return new Contest({
      id: json.id,
      startDate: new Date(json.startDate),
      endDate: new Date(json.endDate),
      state: json.state as ContestState,
      videos: contestingVideosMap,
      winnerID: json.winnerID,
      showVotesToUser: showVotesToUser,
    });
  }

  updateVoteCounts(dto: VoteCountUpdateDto) {
    const updatedVotes = Object.entries(dto).map(([key, value]) => [
      Number(key),
      value,
    ]);

    const totalVotes = updatedVotes.reduce(
      (acc, [, voteCount]) => acc + voteCount,
      0
    );

    updatedVotes.forEach(([videoId, newVoteCount]) => {
      const video = this.videos.get(videoId);
      if (video) {
        video.votesCount = newVoteCount;
        video.votePercent = Math.round((newVoteCount / totalVotes) * 100);
      }
      console.log(video);
    });

    this.showVotesToUser = true;
  }
}
