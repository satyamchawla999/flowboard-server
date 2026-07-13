import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { IUserRepository, USER_REPOSITORY } from '../../domain/contracts/user.repository';
import { TokenService } from '../../infrastructure/auth/token.service';
import { IdentityEmailService } from '../../infrastructure/email/identity-email.service';
import type { ForgotPasswordDto } from './forgot-password.dto';

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MINUTES = PASSWORD_RESET_TTL_MS / 60_000;

@Injectable()
export class ForgotPasswordHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly identityEmailService: IdentityEmailService,
  ) {}

  @Transactional()
  async execute(dto: ForgotPasswordDto): Promise<void> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user || !user.isActive()) return;

    const rawToken = this.tokenService.generateOpaqueToken();
    const hashedToken = this.tokenService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    user.setPasswordResetToken(hashedToken, expiresAt);
    await this.userRepository.save(user);

    await this.identityEmailService.sendPasswordResetEmail({
      to: user.email,
      displayName: user.displayName,
      token: rawToken,
      expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
    });
  }
}
