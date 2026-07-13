import { BaseDomainModel } from '@common/base';
import { WorkspaceInvitationStatus } from '../value-objects/workspace-invitation-status.vo';
import { WorkspaceMemberRole } from '../value-objects/workspace-member-role.vo';

interface CreateWorkspaceInvitationProps {
  workspaceId: string;
  email: string;
  role: WorkspaceMemberRole;
  invitedByUserId: string;
  token: string;
  expiresAt: Date;
}

interface ReconstituteWorkspaceInvitationProps extends CreateWorkspaceInvitationProps {
  id: string;
  status: WorkspaceInvitationStatus;
  acceptedAt: Date | null;
  rejectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkspaceInvitation extends BaseDomainModel {
  workspaceId: string;
  email: string;
  role: WorkspaceMemberRole;
  invitedByUserId: string;
  status: WorkspaceInvitationStatus;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  rejectedAt: Date | null;

  private constructor(props: ReconstituteWorkspaceInvitationProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.email = props.email.toLowerCase();
    this.role = props.role;
    this.invitedByUserId = props.invitedByUserId;
    this.status = props.status;
    this.token = props.token;
    this.expiresAt = props.expiresAt;
    this.acceptedAt = props.acceptedAt;
    this.rejectedAt = props.rejectedAt;
    (this as { createdAt: Date }).createdAt = props.createdAt;
    (this as { updatedAt: Date }).updatedAt = props.updatedAt;
  }

  static create(props: CreateWorkspaceInvitationProps): WorkspaceInvitation {
    const now = new Date();
    return new WorkspaceInvitation({
      id: undefined as unknown as string,
      workspaceId: props.workspaceId,
      email: props.email,
      role: props.role,
      invitedByUserId: props.invitedByUserId,
      status: WorkspaceInvitationStatus.PENDING,
      token: props.token,
      expiresAt: props.expiresAt,
      acceptedAt: null,
      rejectedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ReconstituteWorkspaceInvitationProps): WorkspaceInvitation {
    return new WorkspaceInvitation(props);
  }

  isPending(): boolean {
    return this.status === WorkspaceInvitationStatus.PENDING;
  }

  isExpired(referenceDate = new Date()): boolean {
    return this.expiresAt.getTime() <= referenceDate.getTime();
  }

  markAccepted(): void {
    this.status = WorkspaceInvitationStatus.ACCEPTED;
    this.acceptedAt = new Date();
    this.touch();
  }

  markRejected(): void {
    this.status = WorkspaceInvitationStatus.REJECTED;
    this.rejectedAt = new Date();
    this.touch();
  }

  markCancelled(): void {
    this.status = WorkspaceInvitationStatus.CANCELLED;
    this.touch();
  }

  markExpired(): void {
    this.status = WorkspaceInvitationStatus.EXPIRED;
    this.touch();
  }
}
