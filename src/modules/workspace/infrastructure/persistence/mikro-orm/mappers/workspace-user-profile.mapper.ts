import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { WorkspaceUserProfile } from '../../../../domain/read-models/workspace-user-profile.read-model';
import { WorkspaceUserProfileEntity } from '../entities/workspace-user-profile.entity';

@Injectable()
export class WorkspaceUserProfileMapper implements IMapper<
  WorkspaceUserProfile,
  WorkspaceUserProfileEntity
> {
  toDomain(entity: WorkspaceUserProfileEntity): WorkspaceUserProfile {
    return WorkspaceUserProfile.reconstitute({
      userId: entity.userId,
      email: entity.email,
      displayName: entity.displayName,
      accountStatus: entity.accountStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: WorkspaceUserProfile): WorkspaceUserProfileEntity {
    const entity = new WorkspaceUserProfileEntity();
    entity.userId = domain.userId;
    entity.email = domain.email;
    entity.displayName = domain.displayName;
    entity.accountStatus = domain.accountStatus;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
