import { BaseDomainModel } from '@common/base';
import { ProjectMemberRole } from '../value-objects/project-member-role.vo';

interface CreateProjectMemberProps {
  workspaceId: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
}

interface ReconstituteProjectMemberProps extends CreateProjectMemberProps {
  id: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectMember extends BaseDomainModel {
  workspaceId: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  joinedAt: Date;

  private constructor(props: ReconstituteProjectMemberProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.projectId = props.projectId;
    this.userId = props.userId;
    this.role = props.role;
    this.joinedAt = props.joinedAt;
    (this as { createdAt: Date }).createdAt = props.createdAt;
    (this as { updatedAt: Date }).updatedAt = props.updatedAt;
  }

  static create(props: CreateProjectMemberProps): ProjectMember {
    const now = new Date();
    return new ProjectMember({
      id: undefined as unknown as string,
      workspaceId: props.workspaceId,
      projectId: props.projectId,
      userId: props.userId,
      role: props.role,
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ReconstituteProjectMemberProps): ProjectMember {
    return new ProjectMember(props);
  }

  changeRole(role: ProjectMemberRole): void {
    if (this.role === role) return;
    this.role = role;
    this.touch();
  }
}
