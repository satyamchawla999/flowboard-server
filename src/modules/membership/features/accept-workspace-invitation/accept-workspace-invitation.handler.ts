import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { Transactional } from '@nestjs-cls/transactional';
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../../domain/contracts/workspace-member.repository';
import {
  IWorkspaceInvitationRepository,
  WORKSPACE_INVITATION_REPOSITORY,
} from '../../domain/contracts/workspace-invitation.repository';
import { WorkspaceMember } from '../../domain/models/workspace-member.model';
import { WorkspaceMemberAlreadyExistsError } from '../../domain/errors/membership.errors';
import { MemberJoinedEvent } from '../../domain/events/member-joined.event';
import { MembershipPolicyService } from '../../infrastructure/services/membership-policy.service';
import { WorkspaceInvitationAccessService } from '../../infrastructure/services/workspace-invitation-access.service';

@Injectable()
export class AcceptWorkspaceInvitationHandler {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository,
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IWorkspaceInvitationRepository,
    private readonly invitationAccess: WorkspaceInvitationAccessService,
    private readonly membershipPolicy: MembershipPolicyService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(userId: string, userEmail: string, token: string): Promise<WorkspaceMember> {
    const invitation = await this.invitationAccess.getValidPendingInvitation(token);
    this.membershipPolicy.ensureInvitationBelongsToEmail(invitation, userEmail);

    const existingMember = await this.memberRepository.findByWorkspaceAndUser(
      invitation.workspaceId,
      userId,
    );
    if (existingMember) {
      throw new WorkspaceMemberAlreadyExistsError(invitation.workspaceId, userId);
    }

    const member = WorkspaceMember.create({
      workspaceId: invitation.workspaceId,
      userId,
      role: invitation.role,
    });

    invitation.markAccepted();
    await this.memberRepository.save(member);
    await this.invitationRepository.save(invitation);
    this.eventEmitter.emit(
      MemberJoinedEvent.EVENT_NAME,
      new MemberJoinedEvent(member.workspaceId, member.id, member.userId, member.role),
    );

    return member;
  }
}
