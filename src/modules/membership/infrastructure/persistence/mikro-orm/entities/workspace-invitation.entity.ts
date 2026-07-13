import { Entity, Enum, Index, Property } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';
import { WorkspaceInvitationStatus } from '../../../../domain/value-objects/workspace-invitation-status.vo';
import { WorkspaceMemberRole } from '../../../../domain/value-objects/workspace-member-role.vo';

@Entity({ tableName: 'workspace_invitations' })
@Index({ properties: ['workspaceId'] })
@Index({ properties: ['token'] })
@Index({ properties: ['status'] })
@Index({ properties: ['workspaceId', 'email', 'status'] })
export class WorkspaceInvitationEntity extends BaseEntity {
  @Property({ type: 'uuid' })
  workspaceId!: string;

  @Property()
  email!: string;

  @Enum({ items: () => WorkspaceMemberRole })
  role: WorkspaceMemberRole = WorkspaceMemberRole.MEMBER;

  @Property({ type: 'uuid' })
  invitedByUserId!: string;

  @Enum({ items: () => WorkspaceInvitationStatus })
  status: WorkspaceInvitationStatus = WorkspaceInvitationStatus.PENDING;

  @Property({ type: 'text', unique: true })
  token!: string;

  @Property()
  expiresAt!: Date;

  @Property({ nullable: true })
  acceptedAt: Date | null = null;

  @Property({ nullable: true })
  rejectedAt: Date | null = null;
}
