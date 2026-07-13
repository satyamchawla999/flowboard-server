import { Inject, Injectable } from '@nestjs/common';
import { ISessionRepository, SESSION_REPOSITORY } from '../../domain/contracts/session.repository';
import { Session } from '../../domain/models/session.model';

@Injectable()
export class ListActiveSessionsHandler {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  execute(userId: string): Promise<Session[]> {
    return this.sessionRepository.findActiveByUserId(userId);
  }
}
