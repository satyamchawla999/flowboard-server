import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { IUserRepository, USER_REPOSITORY } from '../../domain/contracts/user.repository';
import { User } from '../../domain/models/user.model';
import { AuthTokenIssuerService } from '../../infrastructure/services/auth-token-issuer.service';
import { DomainEventDispatcherService } from '../../infrastructure/services/domain-event-dispatcher.service';
import { PasswordHasherService } from '../../infrastructure/services/password-hasher.service';
import type { AuthPayloadDto } from '../../contracts/auth-payload.dto';
import type { SignupDto } from './signup.dto';
import { EmailAlreadyExistsError } from '../../infrastructure/http/errors/identity.errors';

@Injectable()
export class SignupHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenIssuer: AuthTokenIssuerService,
    private readonly eventDispatcher: DomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(dto: SignupDto): Promise<AuthPayloadDto> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existing = await this.userRepository.findByEmail(normalizedEmail);

    if (existing) throw new EmailAlreadyExistsError(normalizedEmail);

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const user = User.create({
      email: normalizedEmail,
      displayName: dto.displayName,
      passwordHash,
    });

    await this.userRepository.save(user);
    await this.eventDispatcher.dispatchAggregateEvents(user);

    return this.tokenIssuer.issueTokenPairForSession(user, {
      userAgent: null,
      ipAddress: null,
    });
  }
}
