import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Transactional } from '@nestjs-cls/transactional';
import { DomainEventOutboxService } from '@infrastructure/message-bus/outbox/services/domain-event-outbox.service';
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../../domain/contracts/workspace-member.repository';
import {
  IWorkspaceInvitationRepository,
  WORKSPACE_INVITATION_REPOSITORY,
} from '../../domain/contracts/workspace-invitation.repository';
import {
  IMembershipUserProfileRepository,
  MEMBERSHIP_USER_PROFILE_REPOSITORY,
} from '../../domain/contracts/membership-user-profile.repository';
import { WorkspaceInvitation } from '../../domain/models/workspace-invitation.model';
import {
  WorkspaceInvitationAlreadyPendingError,
  WorkspaceMemberAlreadyExistsError,
} from '../../domain/errors/membership.errors';
import { MemberInvitedEvent } from '../../domain/events/member-invited.event';
import { MembershipPolicyService } from '../../infrastructure/services/membership-policy.service';
import type { InviteWorkspaceMemberDto } from './invite-workspace-member.dto';

const INVITATION_TTL_DAYS = 7;

@Injectable()
export class InviteWorkspaceMemberHandler {
  private readonly logger = new Logger(InviteWorkspaceMemberHandler.name);

  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository,
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IWorkspaceInvitationRepository,
    @Inject(MEMBERSHIP_USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IMembershipUserProfileRepository,
    private readonly membershipPolicy: MembershipPolicyService,
    private readonly outbox: DomainEventOutboxService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: InviteWorkspaceMemberDto): Promise<WorkspaceInvitation> {
    const actor = await this.membershipPolicy.getMemberOrThrow(dto.workspaceId, actorUserId);
    this.membershipPolicy.ensureCanInvite(actor.role, dto.role);

    const email = dto.email.toLowerCase().trim();
    const invitedUser = await this.userProfileRepository.findByEmail(email);
    if (invitedUser) {
      const existingMember = await this.memberRepository.findByWorkspaceAndUser(
        dto.workspaceId,
        invitedUser.userId,
      );
      if (existingMember) {
        throw new WorkspaceMemberAlreadyExistsError(dto.workspaceId, invitedUser.userId);
      }
    }

    const existingInvitation = await this.invitationRepository.findPendingByWorkspaceAndEmail(
      dto.workspaceId,
      email,
    );
    if (existingInvitation) {
      throw new WorkspaceInvitationAlreadyPendingError(dto.workspaceId, email);
    }

    const invitation = WorkspaceInvitation.create({
      workspaceId: dto.workspaceId,
      email,
      role: dto.role,
      invitedByUserId: actorUserId,
      token: randomBytes(32).toString('hex'),
      expiresAt: this.getInvitationExpiry(),
    });

    await this.invitationRepository.save(invitation);
    this.logger.log(`Mock invite email to ${email}: token=${invitation.token}`);
    await this.outbox.store([
      new MemberInvitedEvent(
        invitation.workspaceId,
        invitation.id,
        invitation.email,
        invitation.role,
        invitation.invitedByUserId,
      ),
    ]);

    return invitation;
  }

  private getInvitationExpiry(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS);
    return expiresAt;
  }
}
