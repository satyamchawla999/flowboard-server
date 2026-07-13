import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { WorkspaceInvitation } from '../../../../domain/models/workspace-invitation.model';
import { WorkspaceInvitationEntity } from '../entities/workspace-invitation.entity';

@Injectable()
export class WorkspaceInvitationMapper implements IMapper<
  WorkspaceInvitation,
  WorkspaceInvitationEntity
> {
  toDomain(entity: WorkspaceInvitationEntity): WorkspaceInvitation {
    return WorkspaceInvitation.reconstitute({
      id: entity.id,
      workspaceId: entity.workspaceId,
      email: entity.email,
      role: entity.role,
      invitedByUserId: entity.invitedByUserId,
      status: entity.status,
      token: entity.token,
      expiresAt: entity.expiresAt,
      acceptedAt: entity.acceptedAt,
      rejectedAt: entity.rejectedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: WorkspaceInvitation): WorkspaceInvitationEntity {
    const entity = new WorkspaceInvitationEntity();
    entity.id = domain.id;
    entity.workspaceId = domain.workspaceId;
    entity.email = domain.email;
    entity.role = domain.role;
    entity.invitedByUserId = domain.invitedByUserId;
    entity.status = domain.status;
    entity.token = domain.token;
    entity.expiresAt = domain.expiresAt;
    entity.acceptedAt = domain.acceptedAt;
    entity.rejectedAt = domain.rejectedAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
