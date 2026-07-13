import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { IUserRepository, USER_REPOSITORY } from '../../domain/contracts/user.repository';
import { TokenService } from '../../infrastructure/auth/token.service';
import { DomainEventDispatcherService } from '../../infrastructure/services/domain-event-dispatcher.service';
import { InvalidOrExpiredTokenError } from '../../infrastructure/http/errors/identity.errors';

@Injectable()
export class VerifyEmailHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly eventDispatcher: DomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(token: string): Promise<void> {
    const hashedToken = this.tokenService.hashToken(token);
    const user = await this.userRepository.findByEmailVerificationToken(hashedToken);

    if (!user || !user.emailVerificationTokenExpiresAt) throw new InvalidOrExpiredTokenError();
    if (user.emailVerificationTokenExpiresAt < new Date()) {
      throw new InvalidOrExpiredTokenError();
    }

    user.activate();

    await this.userRepository.save(user);
    this.eventDispatcher.dispatchAggregateEvents(user);
  }
}
