import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import {
  IWorkspaceInvitationRepository,
  WORKSPACE_INVITATION_REPOSITORY,
} from '../../domain/contracts/workspace-invitation.repository';
import type { WorkspaceInvitation } from '../../domain/models/workspace-invitation.model';
import { MembershipPolicyService } from '../../infrastructure/services/membership-policy.service';
import { WorkspaceInvitationAccessService } from '../../infrastructure/services/workspace-invitation-access.service';

@Injectable()
export class RejectWorkspaceInvitationHandler {
  constructor(
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IWorkspaceInvitationRepository,
    private readonly invitationAccess: WorkspaceInvitationAccessService,
    private readonly membershipPolicy: MembershipPolicyService,
  ) {}

  @Transactional()
  async execute(userEmail: string, token: string): Promise<WorkspaceInvitation> {
    const invitation = await this.invitationAccess.getValidPendingInvitation(token);
    this.membershipPolicy.ensureInvitationBelongsToEmail(invitation, userEmail);

    invitation.markRejected();
    await this.invitationRepository.save(invitation);
    return invitation;
  }
}
