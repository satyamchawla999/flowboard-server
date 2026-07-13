import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { IProjectSectionRepository } from '../../../../domain/contracts/project-section.repository';
import { ProjectSection } from '../../../../domain/models/project-section.model';
import { ProjectSectionEntity } from '../entities/project-section.entity';
import { ProjectSectionMapper } from '../mappers/project-section.mapper';

@Injectable()
export class ProjectSectionMikroOrmRepository implements IProjectSectionRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: ProjectSectionMapper,
  ) {}

  async findById(id: string): Promise<ProjectSection | null> {
    const entity = await this.em.findOne(ProjectSectionEntity, { id, deletedAt: null });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIdIncludingDeleted(id: string): Promise<ProjectSection | null> {
    const entity = await this.em.findOne(ProjectSectionEntity, { id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async listByProject(projectId: string): Promise<ProjectSection[]> {
    const entities = await this.em.find(
      ProjectSectionEntity,
      { projectId, deletedAt: null },
      { orderBy: { position: 'ASC' } },
    );
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async listByProjectIncludingDeleted(projectId: string): Promise<ProjectSection[]> {
    const entities = await this.em.find(
      ProjectSectionEntity,
      { projectId },
      {
        orderBy: { position: 'ASC' },
      },
    );
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async findLastByProject(projectId: string): Promise<ProjectSection | null> {
    const entity = await this.em.findOne(
      ProjectSectionEntity,
      { projectId, deletedAt: null },
      { orderBy: { position: 'DESC' } },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(section: ProjectSection): Promise<void> {
    const existing = await this.em.findOne(ProjectSectionEntity, { id: section.id });
    if (existing) {
      this.em.assign(existing, this.mapper.toPersistence(section));
    } else {
      this.em.persist(this.mapper.toPersistence(section));
    }
    await this.em.flush();
  }

  async saveMany(sections: ProjectSection[]): Promise<void> {
    for (const section of sections) {
      const existing = await this.em.findOne(ProjectSectionEntity, { id: section.id });
      if (existing) {
        this.em.assign(existing, this.mapper.toPersistence(section));
      } else {
        this.em.persist(this.mapper.toPersistence(section));
      }
    }
    await this.em.flush();
  }
}
