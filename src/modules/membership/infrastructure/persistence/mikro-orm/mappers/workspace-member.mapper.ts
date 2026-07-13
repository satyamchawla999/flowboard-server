import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { WorkspaceMember } from '../../../../domain/models/workspace-member.model';
import { WorkspaceMemberEntity } from '../entities/workspace-member.entity';

@Injectable()
export class WorkspaceMemberMapper implements IMapper<WorkspaceMember, WorkspaceMemberEntity> {
  toDomain(entity: WorkspaceMemberEntity): WorkspaceMember {
    return WorkspaceMember.reconstitute({
      id: entity.id,
      workspaceId: entity.workspaceId,
      userId: entity.userId,
      role: entity.role,
      joinedAt: entity.joinedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: WorkspaceMember): WorkspaceMemberEntity {
    const entity = new WorkspaceMemberEntity();
    entity.id = domain.id;
    entity.workspaceId = domain.workspaceId;
    entity.userId = domain.userId;
    entity.role = domain.role;
    entity.joinedAt = domain.joinedAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
