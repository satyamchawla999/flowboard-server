import type { WorkspaceMemberRole } from '../../domain/value-objects/workspace-member-role.vo';

export interface ChangeWorkspaceMemberRoleDto {
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
}
