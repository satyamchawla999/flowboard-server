import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { EventEmitter2 } from 'eventemitter2';
import { IUserRepository, USER_REPOSITORY } from '../../domain/contracts/user.repository';
import { UserLoggedInEvent } from '../../domain/events/user-logged-in.event';
import { AuthTokenIssuerService } from '../../infrastructure/services/auth-token-issuer.service';
import { PasswordHasherService } from '../../infrastructure/services/password-hasher.service';
import type { AuthPayloadDto } from '../../contracts/auth-payload.dto';
import type { LoginDto } from './login.dto';
import {
  AccountSuspendedError,
  InvalidCredentialsError,
} from '../../infrastructure/http/errors/identity.errors';

@Injectable()
export class LoginHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenIssuer: AuthTokenIssuerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(dto: LoginDto): Promise<AuthPayloadDto> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) throw new InvalidCredentialsError();

    const passwordValid = await this.passwordHasher.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new InvalidCredentialsError();
    if (!user.isActive()) throw new AccountSuspendedError();

    const result = await this.tokenIssuer.issueTokenPairForSession(user, {
      userAgent: dto.userAgent,
      ipAddress: dto.ipAddress,
    });

    const loginEvent = new UserLoggedInEvent(user.id, result.session.id, dto.ipAddress);
    this.eventEmitter.emit(UserLoggedInEvent.EVENT_NAME, loginEvent);

    return result;
  }
}
