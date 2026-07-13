import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { Project } from '../../../../domain/models/project.model';
import { ProjectEntity } from '../entities/project.entity';

@Injectable()
export class ProjectMapper implements IMapper<Project, ProjectEntity> {
  toDomain(entity: ProjectEntity): Project {
    return Project.reconstitute({
      id: entity.id,
      workspaceId: entity.workspaceId,
      name: entity.name,
      key: entity.key,
      description: entity.description,
      ownerUserId: entity.ownerUserId,
      createdByUserId: entity.createdByUserId,
      healthStatus: entity.healthStatus,
      statusMessage: entity.statusMessage,
      startDate: entity.startDate,
      dueDate: entity.dueDate,
      archivedAt: entity.archivedAt,
      deletedAt: entity.deletedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Project): ProjectEntity {
    const entity = new ProjectEntity();
    entity.id = domain.id;
    entity.workspaceId = domain.workspaceId;
    entity.name = domain.name;
    entity.key = domain.key;
    entity.description = domain.description;
    entity.ownerUserId = domain.ownerUserId;
    entity.createdByUserId = domain.createdByUserId;
    entity.healthStatus = domain.healthStatus;
    entity.statusMessage = domain.statusMessage;
    entity.startDate = domain.startDate;
    entity.dueDate = domain.dueDate;
    entity.archivedAt = domain.archivedAt;
    entity.deletedAt = domain.deletedAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
