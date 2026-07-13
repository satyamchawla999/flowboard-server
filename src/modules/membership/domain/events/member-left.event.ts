import type { WorkspaceMemberRole } from '../value-objects/workspace-member-role.vo';

export class MemberLeftEvent {
  static readonly EVENT_NAME = 'membership.member_left';

  constructor(
    public readonly workspaceId: string,
    public readonly memberId: string,
    public readonly userId: string,
    public readonly role: WorkspaceMemberRole,
  ) {}
}
