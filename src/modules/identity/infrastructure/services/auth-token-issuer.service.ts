import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ISessionRepository, SESSION_REPOSITORY } from '../../domain/contracts/session.repository';
import { IUserRepository, USER_REPOSITORY } from '../../domain/contracts/user.repository';
import { Session } from '../../domain/models/session.model';
import { User } from '../../domain/models/user.model';
import { TokenService } from '../auth/token.service';
import type { AuthPayloadDto } from '../../contracts/auth-payload.dto';
import { InvalidOrExpiredTokenError } from '../http/errors/identity.errors';

export interface SessionMetadata {
  userAgent: string | null;
  ipAddress: string | null;
}

@Injectable()
export class AuthTokenIssuerService {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async issueTokenPairForSession(user: User, metadata: SessionMetadata): Promise<AuthPayloadDto> {
    const sessionId = uuidv4();
    const { accessToken, refreshToken, refreshTokenHash, expiresAt } =
      this.tokenService.generateTokenPair(user.id, user.email, sessionId);

    const session = Session.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      expiresAt,
    });

    await this.sessionRepository.save(session);

    return { accessToken, refreshToken, user, session };
  }

  async rotateRefreshToken(incomingRefreshToken: string): Promise<AuthPayloadDto> {
    const payload = this.tokenService.verifyRefreshToken(incomingRefreshToken);
    if (!payload) throw new InvalidOrExpiredTokenError();

    const session = await this.sessionRepository.findById(payload.sessionId);
    if (!session || !session.isActive()) throw new InvalidOrExpiredTokenError();

    const tokenValid = this.tokenService.compareTokenHash(
      incomingRefreshToken,
      session.refreshTokenHash,
    );
    if (!tokenValid) throw new InvalidOrExpiredTokenError();

    const user = await this.userRepository.findById(session.userId);
    if (!user || !user.isActive()) throw new InvalidOrExpiredTokenError();

    const revoked = await this.sessionRepository.revokeActiveById(session.id);
    if (!revoked) throw new InvalidOrExpiredTokenError();

    const issued = await this.issueTokenPairForSession(user, {
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
    });

    return issued;
  }
}
