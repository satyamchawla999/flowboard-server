import type { IBaseRepository } from '@common/base';
import type { WorkspaceInvitation } from '../models/workspace-invitation.model';

export interface IWorkspaceInvitationRepository extends IBaseRepository<WorkspaceInvitation> {
  findByToken(token: string): Promise<WorkspaceInvitation | null>;
  findPendingByWorkspaceAndEmail(
    workspaceId: string,
    email: string,
  ): Promise<WorkspaceInvitation | null>;
  findPendingByWorkspaceId(workspaceId: string): Promise<WorkspaceInvitation[]>;
}

export const WORKSPACE_INVITATION_REPOSITORY = Symbol('IWorkspaceInvitationRepository');
