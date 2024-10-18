import { Role } from 'src/auth/enums/roles.enum';

export class UserDTO {
  id?: number;
  firstName: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  role?: Role;
}
