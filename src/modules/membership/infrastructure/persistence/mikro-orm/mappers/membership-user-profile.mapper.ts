import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { MembershipUserProfile } from '../../../../domain/read-models/membership-user-profile.read-model';
import { MembershipUserProfileEntity } from '../entities/membership-user-profile.entity';

@Injectable()
export class MembershipUserProfileMapper
  implements IMapper<MembershipUserProfile, MembershipUserProfileEntity>
{
  toDomain(entity: MembershipUserProfileEntity): MembershipUserProfile {
    return MembershipUserProfile.reconstitute({
      userId: entity.userId,
      email: entity.email,
      displayName: entity.displayName,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: MembershipUserProfile): MembershipUserProfileEntity {
    const entity = new MembershipUserProfileEntity();
    entity.userId = domain.userId;
    entity.email = domain.email;
    entity.displayName = domain.displayName;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
