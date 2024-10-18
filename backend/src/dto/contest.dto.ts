import { ContestState } from 'src/enums/contest-state.enum';
import { ContestingVideoDTO } from './contesting-video.dto';

export class ContestDto {
  id: number;
  startDate: Date;
  endDate: Date;
  state: ContestState;
  contestingVideos: ContestingVideoDTO[];
  winnerID?: number;
}
