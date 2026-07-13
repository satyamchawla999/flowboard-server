import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { ISessionRepository, SESSION_REPOSITORY } from '../../domain/contracts/session.repository';
import { IUserRepository, USER_REPOSITORY } from '../../domain/contracts/user.repository';
import { DomainEventDispatcherService } from '../../infrastructure/services/domain-event-dispatcher.service';
import { PasswordHasherService } from '../../infrastructure/services/password-hasher.service';
import { TokenService } from '../../infrastructure/auth/token.service';
import type { ResetPasswordDto } from './reset-password.dto';
import { InvalidOrExpiredTokenError } from '../../infrastructure/http/errors/identity.errors';

@Injectable()
export class ResetPasswordHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenService: TokenService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly eventDispatcher: DomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(dto: ResetPasswordDto): Promise<void> {
    const hashedToken = this.tokenService.hashToken(dto.token);
    const user = await this.userRepository.findByPasswordResetToken(hashedToken);

    if (!user || !user.passwordResetTokenExpiresAt) throw new InvalidOrExpiredTokenError();
    if (user.passwordResetTokenExpiresAt < new Date()) throw new InvalidOrExpiredTokenError();

    const newHash = await this.passwordHasher.hash(dto.newPassword);
    user.updatePasswordHash(newHash);
    user.clearPasswordResetToken();

    await this.userRepository.save(user);
    this.eventDispatcher.dispatchAggregateEvents(user);

    await this.sessionRepository.revokeAllByUserId(user.id);
  }
}
