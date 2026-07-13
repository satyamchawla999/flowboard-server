import { Entity, Enum, Index, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';
import { WorkspaceMemberRole } from '../../../../domain/value-objects/workspace-member-role.vo';

@Entity({ tableName: 'workspace_members' })
@Unique({ properties: ['workspaceId', 'userId'] })
@Index({ properties: ['workspaceId'] })
@Index({ properties: ['userId'] })
export class WorkspaceMemberEntity extends BaseEntity {
  @Property({ type: 'uuid' })
  workspaceId!: string;

  @Property({ type: 'uuid' })
  userId!: string;

  @Enum({ items: () => WorkspaceMemberRole })
  role: WorkspaceMemberRole = WorkspaceMemberRole.MEMBER;

  @Property()
  joinedAt: Date = new Date();
}
