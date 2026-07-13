import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import type { IWorkspaceUserProfileRepository } from '../../../../domain/contracts/workspace-user-profile.repository';
import { WorkspaceUserProfile } from '../../../../domain/read-models/workspace-user-profile.read-model';
import { WorkspaceUserProfileEntity } from '../entities/workspace-user-profile.entity';
import { WorkspaceUserProfileMapper } from '../mappers/workspace-user-profile.mapper';

@Injectable()
export class WorkspaceUserProfileMikroOrmRepository implements IWorkspaceUserProfileRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: WorkspaceUserProfileMapper,
  ) {}

  async findByUserId(userId: string): Promise<WorkspaceUserProfile | null> {
    const entity = await this.em.findOne(WorkspaceUserProfileEntity, { userId });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<WorkspaceUserProfile | null> {
    const entity = await this.em.findOne(WorkspaceUserProfileEntity, {
      email: email.toLowerCase(),
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(profile: WorkspaceUserProfile): Promise<void> {
    const existing = await this.em.findOne(WorkspaceUserProfileEntity, {
      userId: profile.userId,
    });

    if (existing) {
      const updated = this.mapper.toPersistence(profile);
      this.em.assign(existing, updated);
    } else {
      const entity = this.mapper.toPersistence(profile);
      this.em.persist(entity);
    }

    await this.em.flush();
  }

  async delete(userId: string): Promise<void> {
    const entity = await this.em.findOne(WorkspaceUserProfileEntity, { userId });
    if (entity) {
      this.em.remove(entity);
      await this.em.flush();
    }
  }
}
