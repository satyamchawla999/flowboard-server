import { Inject, Injectable } from '@nestjs/common';
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../../domain/contracts/workspace-member.repository';
import type { WorkspaceInvitation } from '../../domain/models/workspace-invitation.model';
import type { WorkspaceMember } from '../../domain/models/workspace-member.model';
import {
  CannotRemoveLastOwnerError,
  InsufficientWorkspacePermissionError,
  WorkspaceInvitationEmailMismatchError,
  WorkspaceMemberNotFoundError,
} from '../../domain/errors/membership.errors';
import { WorkspaceMemberRole } from '../../domain/value-objects/workspace-member-role.vo';

@Injectable()
export class MembershipPolicyService {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository,
  ) {}

  async getMemberOrThrow(workspaceId: string, userId: string): Promise<WorkspaceMember> {
    const member = await this.memberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!member) throw new WorkspaceMemberNotFoundError(workspaceId, userId);
    return member;
  }

  ensureCanInvite(actorRole: WorkspaceMemberRole, invitedRole: WorkspaceMemberRole): void {
    if (actorRole === WorkspaceMemberRole.OWNER) {
      if (invitedRole === WorkspaceMemberRole.OWNER) {
        throw new InsufficientWorkspacePermissionError();
      }
      return;
    }

    if (actorRole === WorkspaceMemberRole.ADMIN && invitedRole === WorkspaceMemberRole.MEMBER) {
      return;
    }

    throw new InsufficientWorkspacePermissionError();
  }

  ensureAdminOrOwner(member: WorkspaceMember): void {
    if (member.role !== WorkspaceMemberRole.OWNER && member.role !== WorkspaceMemberRole.ADMIN) {
      throw new InsufficientWorkspacePermissionError();
    }
  }

  ensureInvitationBelongsToEmail(invitation: WorkspaceInvitation, email: string): void {
    if (email.toLowerCase() !== invitation.email) {
      throw new WorkspaceInvitationEmailMismatchError();
    }
  }

  async ensureNotLastOwner(workspaceId: string): Promise<void> {
    const ownerCount = await this.memberRepository.countByWorkspaceAndRole(
      workspaceId,
      WorkspaceMemberRole.OWNER,
    );
    if (ownerCount <= 1) throw new CannotRemoveLastOwnerError();
  }
}
