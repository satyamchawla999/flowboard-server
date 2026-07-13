import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { AccessTokenPayload } from './token.service';
import type { AuthenticatedUser } from '@common/decorators/current-user.decorator';
import { UnauthorizedError } from '@common/errors';
import {
  ISessionRepository,
  SESSION_REPOSITORY,
} from '../../domain/contracts/session.repository';
import { IUserRepository, USER_REPOSITORY } from '../../domain/contracts/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') ?? 'change_me',
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    const session = await this.sessionRepository.findById(payload.sessionId);
    if (!session || !session.isActive() || session.userId !== payload.sub) {
      throw new UnauthorizedError();
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isActive()) {
      throw new UnauthorizedError();
    }

    return {
      id: payload.sub,
      email: user.email,
      sessionId: payload.sessionId,
    };
  }
}
