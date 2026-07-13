import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import type { IWorkspaceInvitationRepository } from '../../../../domain/contracts/workspace-invitation.repository';
import { WorkspaceInvitation } from '../../../../domain/models/workspace-invitation.model';
import { WorkspaceInvitationStatus } from '../../../../domain/value-objects/workspace-invitation-status.vo';
import { WorkspaceInvitationEntity } from '../entities/workspace-invitation.entity';
import { WorkspaceInvitationMapper } from '../mappers/workspace-invitation.mapper';

@Injectable()
export class WorkspaceInvitationMikroOrmRepository implements IWorkspaceInvitationRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: WorkspaceInvitationMapper,
  ) {}

  async findById(id: string): Promise<WorkspaceInvitation | null> {
    const entity = await this.em.findOne(WorkspaceInvitationEntity, { id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByToken(token: string): Promise<WorkspaceInvitation | null> {
    const entity = await this.em.findOne(WorkspaceInvitationEntity, { token });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findPendingByWorkspaceAndEmail(
    workspaceId: string,
    email: string,
  ): Promise<WorkspaceInvitation | null> {
    const entity = await this.em.findOne(WorkspaceInvitationEntity, {
      workspaceId,
      email: email.toLowerCase(),
      status: WorkspaceInvitationStatus.PENDING,
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findPendingByWorkspaceId(workspaceId: string): Promise<WorkspaceInvitation[]> {
    const entities = await this.em.find(
      WorkspaceInvitationEntity,
      { workspaceId, status: WorkspaceInvitationStatus.PENDING },
      { orderBy: { createdAt: 'DESC' } },
    );
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async findAll(): Promise<WorkspaceInvitation[]> {
    const entities = await this.em.findAll(WorkspaceInvitationEntity);
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async save(invitation: WorkspaceInvitation): Promise<void> {
    const existing = await this.em.findOne(WorkspaceInvitationEntity, { id: invitation.id });

    if (existing) {
      const updated = this.mapper.toPersistence(invitation);
      this.em.assign(existing, updated);
    } else {
      const entity = this.mapper.toPersistence(invitation);
      this.em.persist(entity);
    }

    await this.em.flush();
  }

  async delete(id: string): Promise<void> {
    const entity = await this.em.findOne(WorkspaceInvitationEntity, { id });
    if (entity) {
      this.em.remove(entity);
      await this.em.flush();
    }
  }
}
