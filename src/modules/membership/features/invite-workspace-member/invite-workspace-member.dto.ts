import { WorkspaceMemberRole } from '../../domain/value-objects/workspace-member-role.vo';

export interface InviteWorkspaceMemberDto {
  workspaceId: string;
  email: string;
  role: WorkspaceMemberRole;
}
