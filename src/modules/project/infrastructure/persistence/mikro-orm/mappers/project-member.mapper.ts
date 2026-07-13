import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { ProjectMember } from '../../../../domain/models/project-member.model';
import { ProjectMemberEntity } from '../entities/project-member.entity';

@Injectable()
export class ProjectMemberMapper implements IMapper<ProjectMember, ProjectMemberEntity> {
  toDomain(entity: ProjectMemberEntity): ProjectMember {
    return ProjectMember.reconstitute({
      id: entity.id,
      workspaceId: entity.workspaceId,
      projectId: entity.projectId,
      userId: entity.userId,
      role: entity.role,
      joinedAt: entity.joinedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: ProjectMember): ProjectMemberEntity {
    const entity = new ProjectMemberEntity();
    entity.id = domain.id;
    entity.workspaceId = domain.workspaceId;
    entity.projectId = domain.projectId;
    entity.userId = domain.userId;
    entity.role = domain.role;
    entity.joinedAt = domain.joinedAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
