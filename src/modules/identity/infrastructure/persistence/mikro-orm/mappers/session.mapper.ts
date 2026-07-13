import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { Session } from '../../../../domain/models/session.model';
import { SessionEntity } from '../entities/session.entity';

@Injectable()
export class SessionMapper implements IMapper<Session, SessionEntity> {
  toDomain(entity: SessionEntity): Session {
    return Session.reconstitute({
      id: entity.id,
      userId: entity.userId,
      refreshTokenHash: entity.refreshTokenHash,
      userAgent: entity.userAgent,
      ipAddress: entity.ipAddress,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Session): SessionEntity {
    const entity = new SessionEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.refreshTokenHash = domain.refreshTokenHash;
    entity.userAgent = domain.userAgent;
    entity.ipAddress = domain.ipAddress;
    entity.expiresAt = domain.expiresAt;
    entity.revokedAt = domain.revokedAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
