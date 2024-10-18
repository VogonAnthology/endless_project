import { UserDTO } from './user.dto';

export class ContestingVideoDTO {
  id: number;
  title?: string;
  description?: string;
  fileName: string;
  votesCount?: number;
  user?: UserDTO;
}
