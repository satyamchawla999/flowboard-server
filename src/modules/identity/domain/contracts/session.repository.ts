import type { IBaseRepository } from '@common/base';
import type { Session } from '../models/session.model';

export interface ISessionRepository extends IBaseRepository<Session> {
  findActiveByUserId(userId: string): Promise<Session[]>;
  revokeActiveById(id: string): Promise<boolean>;
  revokeAllByUserId(userId: string): Promise<void>;
}

export const SESSION_REPOSITORY = Symbol('ISessionRepository');
