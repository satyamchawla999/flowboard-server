import { Injectable } from '@nestjs/common';
import { ProjectUserProfile } from '../../../../domain/read-models/project-user-profile.read-model';
import { ProjectUserProfileEntity } from '../entities/project-user-profile.entity';

@Injectable()
export class ProjectUserProfileMapper {
  toDomain(entity: ProjectUserProfileEntity): ProjectUserProfile {
    return ProjectUserProfile.reconstitute({
      userId: entity.userId,
      email: entity.email,
      displayName: entity.displayName,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: ProjectUserProfile): ProjectUserProfileEntity {
    const entity = new ProjectUserProfileEntity();
    entity.userId = domain.userId;
    entity.email = domain.email;
    entity.displayName = domain.displayName;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
