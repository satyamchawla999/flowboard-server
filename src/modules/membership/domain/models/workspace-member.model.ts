import { BaseDomainModel } from '@common/base';
import type { WorkspaceMemberRole } from '../value-objects/workspace-member-role.vo';

interface CreateWorkspaceMemberProps {
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
}

interface ReconstituteWorkspaceMemberProps extends CreateWorkspaceMemberProps {
  id: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkspaceMember extends BaseDomainModel {
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  joinedAt: Date;

  private constructor(props: ReconstituteWorkspaceMemberProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.userId = props.userId;
    this.role = props.role;
    this.joinedAt = props.joinedAt;
    (this as { createdAt: Date }).createdAt = props.createdAt;
    (this as { updatedAt: Date }).updatedAt = props.updatedAt;
  }

  static create(props: CreateWorkspaceMemberProps): WorkspaceMember {
    const now = new Date();
    return new WorkspaceMember({
      id: undefined as unknown as string,
      workspaceId: props.workspaceId,
      userId: props.userId,
      role: props.role,
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ReconstituteWorkspaceMemberProps): WorkspaceMember {
    return new WorkspaceMember(props);
  }

  changeRole(role: WorkspaceMemberRole): void {
    if (this.role === role) return;
    this.role = role;
    this.touch();
  }
}
