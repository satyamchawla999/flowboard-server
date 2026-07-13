import type { ProjectMemberRole } from '../value-objects/project-member-role.vo';

export class ProjectMemberAddedEvent {
  static readonly EVENT_NAME = 'project.member_added';

  constructor(
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly userId: string,
    public readonly role: ProjectMemberRole,
    public readonly actorUserId: string,
  ) {}
}
