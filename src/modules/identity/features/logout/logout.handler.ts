import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { ISessionRepository, SESSION_REPOSITORY } from '../../domain/contracts/session.repository';

@Injectable()
export class LogoutHandler {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  @Transactional()
  async execute(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session || !session.isActive()) return;
    session.revoke();
    await this.sessionRepository.save(session);
  }
}
