import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import {
  IWorkspaceInvitationRepository,
  WORKSPACE_INVITATION_REPOSITORY,
} from '../../domain/contracts/workspace-invitation.repository';
import type { WorkspaceInvitation } from '../../domain/models/workspace-invitation.model';
import { WorkspaceInvitationInvalidError } from '../../domain/errors/membership.errors';
import { MembershipPolicyService } from '../../infrastructure/services/membership-policy.service';

@Injectable()
export class CancelWorkspaceInvitationHandler {
  constructor(
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IWorkspaceInvitationRepository,
    private readonly membershipPolicy: MembershipPolicyService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, invitationId: string): Promise<WorkspaceInvitation> {
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation || !invitation.isPending()) {
      throw new WorkspaceInvitationInvalidError();
    }

    const actor = await this.membershipPolicy.getMemberOrThrow(invitation.workspaceId, actorUserId);
    this.membershipPolicy.ensureAdminOrOwner(actor);

    invitation.markCancelled();
    await this.invitationRepository.save(invitation);
    return invitation;
  }
}
