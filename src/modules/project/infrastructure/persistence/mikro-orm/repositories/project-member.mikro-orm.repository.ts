import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { IProjectMemberRepository } from '../../../../domain/contracts/project-member.repository';
import { ProjectMember } from '../../../../domain/models/project-member.model';
import { ProjectMemberRole } from '../../../../domain/value-objects/project-member-role.vo';
import { ProjectMemberEntity } from '../entities/project-member.entity';
import { ProjectMemberMapper } from '../mappers/project-member.mapper';

@Injectable()
export class ProjectMemberMikroOrmRepository implements IProjectMemberRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: ProjectMemberMapper,
  ) {}

  async findByProjectAndUser(projectId: string, userId: string): Promise<ProjectMember | null> {
    const entity = await this.em.findOne(ProjectMemberEntity, { projectId, userId });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async listByProject(projectId: string): Promise<ProjectMember[]> {
    const entities = await this.em.find(
      ProjectMemberEntity,
      { projectId },
      { orderBy: { joinedAt: 'ASC' } },
    );
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async listProjectIdsForUser(workspaceId: string, userId: string): Promise<string[]> {
    const entities = await this.em.find(ProjectMemberEntity, { workspaceId, userId });
    return entities.map((entity) => entity.projectId);
  }

  async countByProjectAndRole(projectId: string, role: ProjectMemberRole): Promise<number> {
    return this.em.count(ProjectMemberEntity, { projectId, role });
  }

  async save(member: ProjectMember): Promise<void> {
    const existing = await this.em.findOne(ProjectMemberEntity, { id: member.id });

    if (existing) {
      this.em.assign(existing, this.mapper.toPersistence(member));
    } else {
      this.em.persist(this.mapper.toPersistence(member));
    }

    await this.em.flush();
  }

  async delete(id: string): Promise<void> {
    const entity = await this.em.findOne(ProjectMemberEntity, { id });
    if (!entity) return;
    this.em.remove(entity);
    await this.em.flush();
  }
}
