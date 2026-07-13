import { Inject, Injectable } from '@nestjs/common';
import {
  IWorkspaceInvitationRepository,
  WORKSPACE_INVITATION_REPOSITORY,
} from '../../domain/contracts/workspace-invitation.repository';
import type { WorkspaceInvitation } from '../../domain/models/workspace-invitation.model';
import {
  WorkspaceInvitationExpiredError,
  WorkspaceInvitationInvalidError,
} from '../../domain/errors/membership.errors';

@Injectable()
export class WorkspaceInvitationAccessService {
  constructor(
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IWorkspaceInvitationRepository,
  ) {}

  async getValidPendingInvitation(token: string): Promise<WorkspaceInvitation> {
    const invitation = await this.invitationRepository.findByToken(token);
    if (!invitation || !invitation.isPending()) {
      throw new WorkspaceInvitationInvalidError();
    }

    if (invitation.isExpired()) {
      invitation.markExpired();
      await this.invitationRepository.save(invitation);
      throw new WorkspaceInvitationExpiredError();
    }

    return invitation;
  }
}
