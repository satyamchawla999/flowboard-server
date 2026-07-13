import { WorkspaceMemberRole } from '../value-objects/workspace-member-role.vo';

export class MemberRemovedEvent {
  static readonly EVENT_NAME = 'membership.member_removed';

  constructor(
    public readonly workspaceId: string,
    public readonly memberId: string,
    public readonly userId: string,
    public readonly role: WorkspaceMemberRole,
    public readonly removedByUserId: string,
  ) {}
}
