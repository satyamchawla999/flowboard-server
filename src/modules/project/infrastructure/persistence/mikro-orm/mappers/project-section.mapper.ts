import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { ProjectSection } from '../../../../domain/models/project-section.model';
import { ProjectSectionEntity } from '../entities/project-section.entity';

@Injectable()
export class ProjectSectionMapper implements IMapper<ProjectSection, ProjectSectionEntity> {
  toDomain(entity: ProjectSectionEntity): ProjectSection {
    return ProjectSection.reconstitute({
      id: entity.id,
      workspaceId: entity.workspaceId,
      projectId: entity.projectId,
      name: entity.name,
      position: Number(entity.position),
      deletedAt: entity.deletedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: ProjectSection): ProjectSectionEntity {
    const entity = new ProjectSectionEntity();
    entity.id = domain.id;
    entity.workspaceId = domain.workspaceId;
    entity.projectId = domain.projectId;
    entity.name = domain.name;
    entity.position = domain.position.toFixed(6);
    entity.deletedAt = domain.deletedAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
