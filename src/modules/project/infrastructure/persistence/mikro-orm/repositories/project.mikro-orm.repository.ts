import { Injectable } from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/core';
import {
  IProjectRepository,
  ListWorkspaceProjectsOptions,
} from '../../../../domain/contracts/project.repository';
import { Project } from '../../../../domain/models/project.model';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectMapper } from '../mappers/project.mapper';

@Injectable()
export class ProjectMikroOrmRepository implements IProjectRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: ProjectMapper,
  ) {}

  async findById(id: string): Promise<Project | null> {
    const entity = await this.em.findOne(ProjectEntity, { id, deletedAt: null });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByWorkspaceAndKey(workspaceId: string, key: string): Promise<Project | null> {
    const entity = await this.em.findOne(ProjectEntity, {
      workspaceId,
      key,
      deletedAt: null,
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async existsByWorkspaceAndKey(workspaceId: string, key: string): Promise<boolean> {
    const count = await this.em.count(ProjectEntity, { workspaceId, key, deletedAt: null });
    return count > 0;
  }

  async listByWorkspace(
    workspaceId: string,
    options: ListWorkspaceProjectsOptions = {},
  ): Promise<Project[]> {
    const where: FilterQuery<ProjectEntity> = { workspaceId, deletedAt: null };

    if (!options.includeArchived) {
      where.archivedAt = null;
    }

    if (options.projectIds) {
      if (options.projectIds.length === 0) return [];
      where.id = { $in: options.projectIds };
    }

    if (options.search?.trim()) {
      const search = `%${options.search.trim()}%`;
      where.$or = [{ name: { $ilike: search } }, { key: { $ilike: search } }];
    }

    const entities = await this.em.find(ProjectEntity, where, {
      orderBy: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async save(project: Project): Promise<void> {
    const existing = await this.em.findOne(ProjectEntity, { id: project.id });

    if (existing) {
      this.em.assign(existing, this.mapper.toPersistence(project));
    } else {
      this.em.persist(this.mapper.toPersistence(project));
    }

    await this.em.flush();
  }
}
