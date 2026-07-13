import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthTokenIssuerService } from '../../infrastructure/services/auth-token-issuer.service';
import type { AuthPayloadDto } from '../../contracts/auth-payload.dto';

@Injectable()
export class RefreshTokenHandler {
  constructor(private readonly tokenIssuer: AuthTokenIssuerService) {}

  @Transactional()
  execute(refreshToken: string): Promise<AuthPayloadDto> {
    return this.tokenIssuer.rotateRefreshToken(refreshToken);
  }
}
