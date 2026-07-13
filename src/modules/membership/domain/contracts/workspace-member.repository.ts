import type { IBaseRepository } from '@common/base';
import type { WorkspaceMember } from '../models/workspace-member.model';
import type { WorkspaceMemberRole } from '../value-objects/workspace-member-role.vo';

export interface IWorkspaceMemberRepository extends IBaseRepository<WorkspaceMember> {
  findByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceMember | null>;
  findByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]>;
  countByWorkspaceAndRole(workspaceId: string, role: WorkspaceMemberRole): Promise<number>;
}

export const WORKSPACE_MEMBER_REPOSITORY = Symbol('IWorkspaceMemberRepository');
