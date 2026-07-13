import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { ISessionRepository, SESSION_REPOSITORY } from '../../domain/contracts/session.repository';
import { SessionNotFoundError } from '../../infrastructure/http/errors/identity.errors';

@Injectable()
export class RevokeSessionHandler {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  @Transactional()
  async execute(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session || session.userId !== userId || !session.isActive()) {
      throw new SessionNotFoundError(sessionId);
    }

    session.revoke();
    await this.sessionRepository.save(session);
  }
}
