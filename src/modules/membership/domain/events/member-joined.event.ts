import { WorkspaceMemberRole } from '../value-objects/workspace-member-role.vo';

export class MemberJoinedEvent {
  static readonly EVENT_NAME = 'membership.member_joined';

  constructor(
    public readonly workspaceId: string,
    public readonly memberId: string,
    public readonly userId: string,
    public readonly role: WorkspaceMemberRole,
  ) {}
}
