import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { EntityNotFoundError } from '@common/errors';
import { ISessionRepository, SESSION_REPOSITORY } from '../../domain/contracts/session.repository';
import { IUserRepository, USER_REPOSITORY } from '../../domain/contracts/user.repository';
import { DomainEventDispatcherService } from '../../infrastructure/services/domain-event-dispatcher.service';
import { PasswordHasherService } from '../../infrastructure/services/password-hasher.service';
import type { ChangePasswordDto } from './change-password.dto';
import { PasswordMismatchError } from '../../infrastructure/http/errors/identity.errors';

@Injectable()
export class ChangePasswordHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly eventDispatcher: DomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new EntityNotFoundError('User', userId);

    const passwordValid = await this.passwordHasher.compare(dto.currentPassword, user.passwordHash);
    if (!passwordValid) throw new PasswordMismatchError();

    const newHash = await this.passwordHasher.hash(dto.newPassword);
    user.updatePasswordHash(newHash);

    await this.userRepository.save(user);
    this.eventDispatcher.dispatchAggregateEvents(user);

    await this.sessionRepository.revokeAllByUserId(userId);
  }
}
