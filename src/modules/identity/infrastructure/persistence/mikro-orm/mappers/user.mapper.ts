import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { User } from '../../../../domain/models/user.model';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserMapper implements IMapper<User, UserEntity> {
  toDomain(entity: UserEntity): User {
    return User.reconstitute({
      id: entity.id,
      email: entity.email,
      displayName: entity.displayName,
      timezone: entity.timezone,
      accountStatus: entity.accountStatus,
      passwordHash: entity.passwordHash,
      passwordResetToken: entity.passwordResetToken,
      passwordResetTokenExpiresAt: entity.passwordResetTokenExpiresAt,
      emailVerificationToken: entity.emailVerificationToken,
      emailVerificationTokenExpiresAt: entity.emailVerificationTokenExpiresAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.displayName = domain.displayName;
    entity.timezone = domain.timezone;
    entity.accountStatus = domain.accountStatus;
    entity.passwordHash = domain.passwordHash;
    entity.passwordResetToken = domain.passwordResetToken;
    entity.passwordResetTokenExpiresAt = domain.passwordResetTokenExpiresAt;
    entity.emailVerificationToken = domain.emailVerificationToken;
    entity.emailVerificationTokenExpiresAt = domain.emailVerificationTokenExpiresAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
