import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import type { IWorkspaceRepository } from '../../../../domain/contracts/workspace.repository';
import { Workspace } from '../../../../domain/models/workspace.model';
import { WorkspaceEntity } from '../entities/workspace.entity';
import { WorkspaceMapper } from '../mappers/workspace.mapper';

@Injectable()
export class WorkspaceMikroOrmRepository implements IWorkspaceRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: WorkspaceMapper,
  ) {}

  async findById(id: string): Promise<Workspace | null> {
    // Standard fetch excludes soft-deleted items
    const entity = await this.em.findOne(WorkspaceEntity, { id, isDeleted: false });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    const entity = await this.em.findOne(WorkspaceEntity, { slug, isDeleted: false });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Workspace[]> {
    const entities = await this.em.find(WorkspaceEntity, { ownerId, isDeleted: false });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findAll(): Promise<Workspace[]> {
    const entities = await this.em.find(WorkspaceEntity, { isDeleted: false });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(workspace: Workspace): Promise<void> {
    const existing = await this.em.findOne(WorkspaceEntity, { id: workspace.id });

    if (existing) {
      const updated = this.mapper.toPersistence(workspace);
      this.em.assign(existing, updated);
    } else {
      const entity = this.mapper.toPersistence(workspace);
      this.em.persist(entity);
    }

    await this.em.flush();
  }

  async delete(id: string): Promise<void> {
    const entity = await this.em.findOne(WorkspaceEntity, { id });
    if (entity) {
      this.em.remove(entity);
      await this.em.flush();
    }
  }
}
