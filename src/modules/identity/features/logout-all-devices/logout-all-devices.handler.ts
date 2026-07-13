import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { ISessionRepository, SESSION_REPOSITORY } from '../../domain/contracts/session.repository';

@Injectable()
export class LogoutAllDevicesHandler {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  @Transactional()
  execute(userId: string): Promise<void> {
    return this.sessionRepository.revokeAllByUserId(userId);
  }
}
