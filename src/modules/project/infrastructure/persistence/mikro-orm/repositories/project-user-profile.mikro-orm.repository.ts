import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { IProjectUserProfileRepository } from '../../../../domain/contracts/project-user-profile.repository';
import { ProjectUserProfile } from '../../../../domain/read-models/project-user-profile.read-model';
import { ProjectUserProfileEntity } from '../entities/project-user-profile.entity';
import { ProjectUserProfileMapper } from '../mappers/project-user-profile.mapper';

@Injectable()
export class ProjectUserProfileMikroOrmRepository implements IProjectUserProfileRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: ProjectUserProfileMapper,
  ) {}

  async findByUserId(userId: string): Promise<ProjectUserProfile | null> {
    const entity = await this.em.findOne(ProjectUserProfileEntity, { userId });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByUserIds(userIds: string[]): Promise<ProjectUserProfile[]> {
    if (userIds.length === 0) return [];
    const entities = await this.em.find(ProjectUserProfileEntity, {
      userId: { $in: userIds },
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async save(profile: ProjectUserProfile): Promise<void> {
    const existing = await this.em.findOne(ProjectUserProfileEntity, {
      userId: profile.userId,
    });

    if (existing) {
      this.em.assign(existing, this.mapper.toPersistence(profile));
    } else {
      this.em.persist(this.mapper.toPersistence(profile));
    }

    await this.em.flush();
  }
}
