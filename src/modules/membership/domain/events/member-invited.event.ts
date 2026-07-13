import { WorkspaceMemberRole } from '../value-objects/workspace-member-role.vo';

export class MemberInvitedEvent {
  static readonly EVENT_NAME = 'membership.member_invited';

  constructor(
    public readonly workspaceId: string,
    public readonly invitationId: string,
    public readonly email: string,
    public readonly role: WorkspaceMemberRole,
    public readonly invitedByUserId: string,
  ) {}
}
