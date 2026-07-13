import { Inject, Injectable } from '@nestjs/common';
import {
  IWorkspaceInvitationRepository,
  WORKSPACE_INVITATION_REPOSITORY,
} from '../../domain/contracts/workspace-invitation.repository';
import type { WorkspaceInvitation } from '../../domain/models/workspace-invitation.model';
import { MembershipPolicyService } from '../../infrastructure/services/membership-policy.service';

@Injectable()
export class ListWorkspaceInvitationsHandler {
  constructor(
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IWorkspaceInvitationRepository,
    private readonly membershipPolicy: MembershipPolicyService,
  ) {}

  async execute(userId: string, workspaceId: string): Promise<WorkspaceInvitation[]> {
    const actor = await this.membershipPolicy.getMemberOrThrow(workspaceId, userId);
    this.membershipPolicy.ensureAdminOrOwner(actor);

    return this.invitationRepository.findPendingByWorkspaceId(workspaceId);
  }
}
