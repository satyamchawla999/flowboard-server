import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { EntityNotFoundError } from '@common/errors';
import { IUserRepository, USER_REPOSITORY } from '../../domain/contracts/user.repository';
import { TokenService } from '../../infrastructure/auth/token.service';
import { IdentityEmailService } from '../../infrastructure/email/identity-email.service';

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const EMAIL_VERIFICATION_TTL_HOURS = EMAIL_VERIFICATION_TTL_MS / 3_600_000;

@Injectable()
export class SendVerificationEmailHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly identityEmailService: IdentityEmailService,
  ) {}

  @Transactional()
  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new EntityNotFoundError('User', userId);

    const rawToken = this.tokenService.generateOpaqueToken();
    const hashedToken = this.tokenService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

    user.setEmailVerificationToken(hashedToken, expiresAt);
    await this.userRepository.save(user);

    await this.identityEmailService.sendEmailVerificationEmail({
      to: user.email,
      displayName: user.displayName,
      token: rawToken,
      expiresInHours: EMAIL_VERIFICATION_TTL_HOURS,
    });
  }
}
