import type { Session } from '../domain/models/session.model';
import type { User } from '../domain/models/user.model';

export interface AuthPayloadDto {
  accessToken: string;
  refreshToken: string;
  user: User;
  session: Session;
}
