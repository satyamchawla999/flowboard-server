import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import type { IWorkspaceMemberRepository } from '../../../../domain/contracts/workspace-member.repository';
import { WorkspaceMember } from '../../../../domain/models/workspace-member.model';
import { WorkspaceMemberRole } from '../../../../domain/value-objects/workspace-member-role.vo';
import { WorkspaceMemberEntity } from '../entities/workspace-member.entity';
import { WorkspaceMemberMapper } from '../mappers/workspace-member.mapper';

@Injectable()
export class WorkspaceMemberMikroOrmRepository implements IWorkspaceMemberRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: WorkspaceMemberMapper,
  ) {}

  async findById(id: string): Promise<WorkspaceMember | null> {
    const entity = await this.em.findOne(WorkspaceMemberEntity, { id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null> {
    const entity = await this.em.findOne(WorkspaceMemberEntity, { workspaceId, userId });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]> {
    const entities = await this.em.find(
      WorkspaceMemberEntity,
      { workspaceId },
      { orderBy: { joinedAt: 'ASC' } },
    );
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async countByWorkspaceAndRole(workspaceId: string, role: WorkspaceMemberRole): Promise<number> {
    return this.em.count(WorkspaceMemberEntity, { workspaceId, role });
  }

  async findAll(): Promise<WorkspaceMember[]> {
    const entities = await this.em.findAll(WorkspaceMemberEntity);
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async save(member: WorkspaceMember): Promise<void> {
    const existing = await this.em.findOne(WorkspaceMemberEntity, { id: member.id });

    if (existing) {
      const updated = this.mapper.toPersistence(member);
      this.em.assign(existing, updated);
    } else {
      const entity = this.mapper.toPersistence(member);
      this.em.persist(entity);
    }

    await this.em.flush();
  }

  async delete(id: string): Promise<void> {
    const entity = await this.em.findOne(WorkspaceMemberEntity, { id });
    if (entity) {
      this.em.remove(entity);
      await this.em.flush();
    }
  }
}
