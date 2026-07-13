import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  sessionId: string;
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateTokenPair(userId: string, email: string, sessionId: string): TokenPair {
    const accessToken = this.jwtService.sign(
      { sub: userId, email, sessionId } satisfies AccessTokenPayload,
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
      },
    );

    const refreshTokenRaw = uuidv4();
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn');

    const refreshToken = this.jwtService.sign(
      { sub: userId, sessionId, jti: refreshTokenRaw } as RefreshTokenPayload & { jti: string },
      { secret: refreshSecret, expiresIn: refreshExpiresIn },
    );

    const refreshTokenHash = this.hashToken(refreshToken);
    const expiresAt = this.parseExpiryToDate(refreshExpiresIn ?? '30d');

    return { accessToken, refreshToken, refreshTokenHash, expiresAt };
  }

  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      return this.jwtService.verify<AccessTokenPayload>(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): (RefreshTokenPayload & { jti: string }) | null {
    try {
      return this.jwtService.verify<RefreshTokenPayload & { jti: string }>(token, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      return null;
    }
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  compareTokenHash(token: string, hash: string): boolean {
    return this.hashToken(token) === hash;
  }

  generateOpaqueToken(): string {
    return randomBytes(32).toString('hex');
  }

  private parseExpiryToDate(expiry: string): Date {
    const unit = expiry.slice(-1);
    const amount = parseInt(expiry.slice(0, -1), 10);
    const ms =
      unit === 'd'
        ? amount * 86_400_000
        : unit === 'h'
          ? amount * 3_600_000
          : unit === 'm'
            ? amount * 60_000
            : amount * 1_000;
    return new Date(Date.now() + ms);
  }
}
