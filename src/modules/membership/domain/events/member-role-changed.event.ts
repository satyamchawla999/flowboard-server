import { WorkspaceMemberRole } from '../value-objects/workspace-member-role.vo';

export class MemberRoleChangedEvent {
  static readonly EVENT_NAME = 'membership.member_role_changed';

  constructor(
    public readonly workspaceId: string,
    public readonly memberId: string,
    public readonly userId: string,
    public readonly previousRole: WorkspaceMemberRole,
    public readonly newRole: WorkspaceMemberRole,
    public readonly changedByUserId: string,
  ) {}
}
