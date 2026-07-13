import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { EventEmitter2 } from 'eventemitter2';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkspaceCreatedEvent } from '@modules/workspace/domain/events/workspace-created.event';
import {
  IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../../domain/contracts/workspace-member.repository';
import {
  IMembershipUserProfileRepository,
  MEMBERSHIP_USER_PROFILE_REPOSITORY,
} from '../../domain/contracts/membership-user-profile.repository';
import {
  IWorkspaceInvitationRepository,
  WORKSPACE_INVITATION_REPOSITORY,
} from '../../domain/contracts/workspace-invitation.repository';
import { WorkspaceMember } from '../../domain/models/workspace-member.model';
import { WorkspaceInvitation } from '../../domain/models/workspace-invitation.model';
import { WorkspaceMemberRole } from '../../domain/value-objects/workspace-member-role.vo';
import {
  CannotChangeOwnOwnerRoleError,
  CannotLeaveAsLastOwnerError,
  CannotRemoveLastOwnerError,
  InsufficientWorkspacePermissionError,
  WorkspaceInvitationAlreadyPendingError,
  WorkspaceInvitationEmailMismatchError,
  WorkspaceInvitationExpiredError,
  WorkspaceInvitationInvalidError,
  WorkspaceMemberAlreadyExistsError,
  WorkspaceMemberNotFoundError,
} from '../../domain/errors/membership.errors';
import { MemberInvitedEvent } from '../../domain/events/member-invited.event';
import { MemberJoinedEvent } from '../../domain/events/member-joined.event';
import { MemberRemovedEvent } from '../../domain/events/member-removed.event';
import { MemberLeftEvent } from '../../domain/events/member-left.event';
import { MemberRoleChangedEvent } from '../../domain/events/member-role-changed.event';
import { OwnershipTransferredEvent } from '../../domain/events/ownership-transferred.event';
import type { InviteWorkspaceMemberDto } from '../dto/invite-workspace-member.dto';
import type { ChangeWorkspaceMemberRoleDto } from '../dto/change-workspace-member-role.dto';
import type { RemoveWorkspaceMemberDto } from '../dto/remove-workspace-member.dto';
import type { TransferWorkspaceOwnershipDto } from '../dto/transfer-workspace-ownership.dto';

const INVITATION_TTL_DAYS = 7;

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);

  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository,
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IWorkspaceInvitationRepository,
    @Inject(MEMBERSHIP_USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IMembershipUserProfileRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(WorkspaceCreatedEvent.EVENT_NAME)
  async handleWorkspaceCreated(event: WorkspaceCreatedEvent): Promise<void> {
    const existing = await this.memberRepository.findByWorkspaceAndUser(
      event.workspaceId,
      event.ownerId,
    );
    if (existing) return;

    const owner = WorkspaceMember.create({
      workspaceId: event.workspaceId,
      userId: event.ownerId,
      role: WorkspaceMemberRole.OWNER,
    });

    await this.memberRepository.save(owner);
    this.eventEmitter.emit(
      MemberJoinedEvent.EVENT_NAME,
      new MemberJoinedEvent(owner.workspaceId, owner.id, owner.userId, owner.role),
    );
  }

  async inviteMember(
    actorUserId: string,
    dto: InviteWorkspaceMemberDto,
  ): Promise<WorkspaceInvitation> {
    const actor = await this.getMemberOrThrow(dto.workspaceId, actorUserId);
    this.ensureCanInvite(actor.role, dto.role);

    const email = dto.email.toLowerCase();
    const invitedUser = await this.userProfileRepository.findByEmail(email);
    if (invitedUser) {
      const existingMember = await this.memberRepository.findByWorkspaceAndUser(
        dto.workspaceId,
        invitedUser.userId,
      );
      if (existingMember)
        throw new WorkspaceMemberAlreadyExistsError(dto.workspaceId, invitedUser.userId);
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
    this.eventEmitter.emit(
      MemberInvitedEvent.EVENT_NAME,
      new MemberInvitedEvent(
        invitation.workspaceId,
        invitation.id,
        invitation.email,
        invitation.role,
        invitation.invitedByUserId,
      ),
    );

    return invitation;
  }

  async acceptInvitation(
    userId: string,
    userEmail: string,
    token: string,
  ): Promise<WorkspaceMember> {
    const invitation = await this.getValidPendingInvitation(token);
    if (userEmail.toLowerCase() !== invitation.email) {
      throw new WorkspaceInvitationEmailMismatchError();
    }

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

  async rejectInvitation(userEmail: string, token: string): Promise<WorkspaceInvitation> {
    const invitation = await this.getValidPendingInvitation(token);
    if (userEmail.toLowerCase() !== invitation.email) {
      throw new WorkspaceInvitationEmailMismatchError();
    }

    invitation.markRejected();
    await this.invitationRepository.save(invitation);
    return invitation;
  }

  async cancelInvitation(actorUserId: string, invitationId: string): Promise<WorkspaceInvitation> {
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation || !invitation.isPending()) {
      throw new WorkspaceInvitationInvalidError();
    }

    const actor = await this.getMemberOrThrow(invitation.workspaceId, actorUserId);
    if (actor.role !== WorkspaceMemberRole.OWNER && actor.role !== WorkspaceMemberRole.ADMIN) {
      throw new InsufficientWorkspacePermissionError();
    }

    invitation.markCancelled();
    await this.invitationRepository.save(invitation);
    return invitation;
  }

  async listWorkspaceMembers(userId: string, workspaceId: string): Promise<WorkspaceMember[]> {
    await this.getMemberOrThrow(workspaceId, userId);
    return this.memberRepository.findByWorkspaceId(workspaceId);
  }

  async listPendingInvitations(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceInvitation[]> {
    const actor = await this.getMemberOrThrow(workspaceId, userId);
    if (actor.role !== WorkspaceMemberRole.OWNER && actor.role !== WorkspaceMemberRole.ADMIN) {
      throw new InsufficientWorkspacePermissionError();
    }

    return this.invitationRepository.findPendingByWorkspaceId(workspaceId);
  }

  async changeMemberRole(
    actorUserId: string,
    dto: ChangeWorkspaceMemberRoleDto,
  ): Promise<WorkspaceMember> {
    const actor = await this.getMemberOrThrow(dto.workspaceId, actorUserId);
    if (actor.role !== WorkspaceMemberRole.OWNER) {
      throw new InsufficientWorkspacePermissionError();
    }
    if (actorUserId === dto.userId && actor.role === WorkspaceMemberRole.OWNER) {
      throw new CannotChangeOwnOwnerRoleError();
    }
    if (dto.role === WorkspaceMemberRole.OWNER) {
      throw new InsufficientWorkspacePermissionError();
    }

    const target = await this.getMemberOrThrow(dto.workspaceId, dto.userId);
    if (target.role === WorkspaceMemberRole.OWNER) {
      throw new CannotChangeOwnOwnerRoleError();
    }

    const previousRole = target.role;
    target.changeRole(dto.role);
    await this.memberRepository.save(target);
    this.eventEmitter.emit(
      MemberRoleChangedEvent.EVENT_NAME,
      new MemberRoleChangedEvent(
        target.workspaceId,
        target.id,
        target.userId,
        previousRole,
        target.role,
        actorUserId,
      ),
    );

    return target;
  }

  async removeMember(actorUserId: string, dto: RemoveWorkspaceMemberDto): Promise<void> {
    const actor = await this.getMemberOrThrow(dto.workspaceId, actorUserId);
    const target = await this.getMemberOrThrow(dto.workspaceId, dto.userId);

    if (target.role === WorkspaceMemberRole.OWNER) {
      await this.ensureNotLastOwner(dto.workspaceId);
    }

    if (actor.role === WorkspaceMemberRole.OWNER) {
      if (target.role === WorkspaceMemberRole.OWNER) {
        throw new CannotRemoveLastOwnerError();
      }
    } else if (actor.role === WorkspaceMemberRole.ADMIN) {
      if (target.role !== WorkspaceMemberRole.MEMBER) {
        throw new InsufficientWorkspacePermissionError();
      }
    } else {
      throw new InsufficientWorkspacePermissionError();
    }

    await this.memberRepository.delete(target.id);
    this.eventEmitter.emit(
      MemberRemovedEvent.EVENT_NAME,
      new MemberRemovedEvent(
        target.workspaceId,
        target.id,
        target.userId,
        target.role,
        actorUserId,
      ),
    );
  }

  async leaveWorkspace(userId: string, workspaceId: string): Promise<void> {
    const member = await this.getMemberOrThrow(workspaceId, userId);
    if (member.role === WorkspaceMemberRole.OWNER) {
      const ownerCount = await this.memberRepository.countByWorkspaceAndRole(
        workspaceId,
        WorkspaceMemberRole.OWNER,
      );
      if (ownerCount <= 1) throw new CannotLeaveAsLastOwnerError();
    }

    await this.memberRepository.delete(member.id);
    this.eventEmitter.emit(
      MemberLeftEvent.EVENT_NAME,
      new MemberLeftEvent(member.workspaceId, member.id, member.userId, member.role),
    );
  }

  async transferOwnership(
    actorUserId: string,
    dto: TransferWorkspaceOwnershipDto,
  ): Promise<WorkspaceMember> {
    const actor = await this.getMemberOrThrow(dto.workspaceId, actorUserId);
    if (actor.role !== WorkspaceMemberRole.OWNER) {
      throw new InsufficientWorkspacePermissionError();
    }
    if (actorUserId === dto.targetUserId) {
      throw new InsufficientWorkspacePermissionError();
    }

    const target = await this.getMemberOrThrow(dto.workspaceId, dto.targetUserId);
    target.changeRole(WorkspaceMemberRole.OWNER);
    actor.changeRole(WorkspaceMemberRole.ADMIN);

    await this.memberRepository.save(target);
    await this.memberRepository.save(actor);
    this.eventEmitter.emit(
      OwnershipTransferredEvent.EVENT_NAME,
      new OwnershipTransferredEvent(dto.workspaceId, actorUserId, target.userId),
    );

    return target;
  }

  private async getValidPendingInvitation(token: string): Promise<WorkspaceInvitation> {
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

  private async getMemberOrThrow(workspaceId: string, userId: string): Promise<WorkspaceMember> {
    const member = await this.memberRepository.findByWorkspaceAndUser(workspaceId, userId);
    if (!member) throw new WorkspaceMemberNotFoundError(workspaceId, userId);
    return member;
  }

  private ensureCanInvite(actorRole: WorkspaceMemberRole, invitedRole: WorkspaceMemberRole): void {
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

  private async ensureNotLastOwner(workspaceId: string): Promise<void> {
    const ownerCount = await this.memberRepository.countByWorkspaceAndRole(
      workspaceId,
      WorkspaceMemberRole.OWNER,
    );
    if (ownerCount <= 1) throw new CannotRemoveLastOwnerError();
  }

  private getInvitationExpiry(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS);
    return expiresAt;
  }
}
