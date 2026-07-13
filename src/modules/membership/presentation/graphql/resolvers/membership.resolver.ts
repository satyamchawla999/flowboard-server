import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from '@common/decorators/current-user.decorator';
import { InviteWorkspaceMemberHandler } from '../../../features/invite-workspace-member/invite-workspace-member.handler';
import { AcceptWorkspaceInvitationHandler } from '../../../features/accept-workspace-invitation/accept-workspace-invitation.handler';
import { RejectWorkspaceInvitationHandler } from '../../../features/reject-workspace-invitation/reject-workspace-invitation.handler';
import { CancelWorkspaceInvitationHandler } from '../../../features/cancel-workspace-invitation/cancel-workspace-invitation.handler';
import { ListWorkspaceMembersHandler } from '../../../features/list-workspace-members/list-workspace-members.handler';
import { ListWorkspaceInvitationsHandler } from '../../../features/list-workspace-invitations/list-workspace-invitations.handler';
import { ChangeWorkspaceMemberRoleHandler } from '../../../features/change-workspace-member-role/change-workspace-member-role.handler';
import { RemoveWorkspaceMemberHandler } from '../../../features/remove-workspace-member/remove-workspace-member.handler';
import { LeaveWorkspaceHandler } from '../../../features/leave-workspace/leave-workspace.handler';
import { TransferWorkspaceOwnershipHandler } from '../../../features/transfer-workspace-ownership/transfer-workspace-ownership.handler';
import {
  IMembershipUserProfileRepository,
  MEMBERSHIP_USER_PROFILE_REPOSITORY,
} from '../../../domain/contracts/membership-user-profile.repository';
import { WorkspaceMember } from '../../../domain/models/workspace-member.model';
import { WorkspaceInvitation } from '../../../domain/models/workspace-invitation.model';
import { InviteWorkspaceMemberInput } from '../inputs/invite-workspace-member.input';
import { ChangeWorkspaceMemberRoleInput } from '../inputs/change-workspace-member-role.input';
import { RemoveWorkspaceMemberInput } from '../inputs/remove-workspace-member.input';
import { TransferWorkspaceOwnershipInput } from '../inputs/transfer-workspace-ownership.input';
import {
  WorkspaceMemberGqlModel,
  WorkspaceMemberUserGqlModel,
} from '../models/workspace-member.model';
import { WorkspaceInvitationGqlModel } from '../models/workspace-invitation.model';

@Resolver(() => WorkspaceMemberGqlModel)
export class MembershipResolver {
  constructor(
    private readonly inviteWorkspaceMemberHandler: InviteWorkspaceMemberHandler,
    private readonly acceptWorkspaceInvitationHandler: AcceptWorkspaceInvitationHandler,
    private readonly rejectWorkspaceInvitationHandler: RejectWorkspaceInvitationHandler,
    private readonly cancelWorkspaceInvitationHandler: CancelWorkspaceInvitationHandler,
    private readonly listWorkspaceMembersHandler: ListWorkspaceMembersHandler,
    private readonly listWorkspaceInvitationsHandler: ListWorkspaceInvitationsHandler,
    private readonly changeWorkspaceMemberRoleHandler: ChangeWorkspaceMemberRoleHandler,
    private readonly removeWorkspaceMemberHandler: RemoveWorkspaceMemberHandler,
    private readonly leaveWorkspaceHandler: LeaveWorkspaceHandler,
    private readonly transferWorkspaceOwnershipHandler: TransferWorkspaceOwnershipHandler,
    @Inject(MEMBERSHIP_USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IMembershipUserProfileRepository,
  ) {}

  @Mutation(() => WorkspaceInvitationGqlModel)
  async inviteWorkspaceMember(
    @Args('input') input: InviteWorkspaceMemberInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceInvitationGqlModel> {
    const invitation = await this.inviteWorkspaceMemberHandler.execute(user.id, {
      workspaceId: input.workspaceId,
      email: input.email,
      role: input.role,
    });
    return this.toInvitationGql(invitation);
  }

  @Mutation(() => WorkspaceMemberGqlModel)
  async acceptWorkspaceInvitation(
    @Args('token') token: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceMemberGqlModel> {
    const member = await this.acceptWorkspaceInvitationHandler.execute(user.id, user.email, token);
    return this.toMemberGql(member);
  }

  @Mutation(() => WorkspaceInvitationGqlModel)
  async rejectWorkspaceInvitation(
    @Args('token') token: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceInvitationGqlModel> {
    const invitation = await this.rejectWorkspaceInvitationHandler.execute(user.email, token);
    return this.toInvitationGql(invitation);
  }

  @Mutation(() => WorkspaceInvitationGqlModel)
  async cancelWorkspaceInvitation(
    @Args('invitationId', { type: () => ID }) invitationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceInvitationGqlModel> {
    const invitation = await this.cancelWorkspaceInvitationHandler.execute(user.id, invitationId);
    return this.toInvitationGql(invitation);
  }

  @Query(() => [WorkspaceMemberGqlModel])
  async workspaceMembers(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceMemberGqlModel[]> {
    const members = await this.listWorkspaceMembersHandler.execute(user.id, workspaceId);
    return Promise.all(members.map((member) => this.toMemberGql(member, true)));
  }

  @Query(() => [WorkspaceInvitationGqlModel])
  async workspaceInvitations(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceInvitationGqlModel[]> {
    const invitations = await this.listWorkspaceInvitationsHandler.execute(user.id, workspaceId);
    return invitations.map((invitation) => this.toInvitationGql(invitation));
  }

  @Mutation(() => WorkspaceMemberGqlModel)
  async changeWorkspaceMemberRole(
    @Args('input') input: ChangeWorkspaceMemberRoleInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceMemberGqlModel> {
    const member = await this.changeWorkspaceMemberRoleHandler.execute(user.id, {
      workspaceId: input.workspaceId,
      userId: input.userId,
      role: input.role,
    });
    return this.toMemberGql(member);
  }

  @Mutation(() => Boolean)
  async removeWorkspaceMember(
    @Args('input') input: RemoveWorkspaceMemberInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.removeWorkspaceMemberHandler.execute(user.id, {
      workspaceId: input.workspaceId,
      userId: input.userId,
    });
    return true;
  }

  @Mutation(() => Boolean)
  async leaveWorkspace(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.leaveWorkspaceHandler.execute(user.id, workspaceId);
    return true;
  }

  @Mutation(() => WorkspaceMemberGqlModel)
  async transferWorkspaceOwnership(
    @Args('input') input: TransferWorkspaceOwnershipInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceMemberGqlModel> {
    const member = await this.transferWorkspaceOwnershipHandler.execute(user.id, {
      workspaceId: input.workspaceId,
      targetUserId: input.targetUserId,
    });
    return this.toMemberGql(member);
  }

  private async toMemberGql(
    member: WorkspaceMember,
    includeUser = false,
  ): Promise<WorkspaceMemberGqlModel> {
    const model = new WorkspaceMemberGqlModel();
    model.id = member.id;
    model.workspaceId = member.workspaceId;
    model.userId = member.userId;
    model.role = member.role;
    model.joinedAt = member.joinedAt;
    model.createdAt = member.createdAt;
    model.updatedAt = member.updatedAt;

    if (includeUser) {
      const user = await this.userProfileRepository.findByUserId(member.userId);
      if (user) {
        const userModel = new WorkspaceMemberUserGqlModel();
        userModel.id = user.userId;
        userModel.email = user.email;
        userModel.displayName = user.displayName;
        model.user = userModel;
      }
    }

    return model;
  }

  private toInvitationGql(invitation: WorkspaceInvitation): WorkspaceInvitationGqlModel {
    const model = new WorkspaceInvitationGqlModel();
    model.id = invitation.id;
    model.workspaceId = invitation.workspaceId;
    model.email = invitation.email;
    model.role = invitation.role;
    model.invitedByUserId = invitation.invitedByUserId;
    model.status = invitation.status;
    model.token = invitation.token;
    model.expiresAt = invitation.expiresAt;
    model.acceptedAt = invitation.acceptedAt ?? undefined;
    model.rejectedAt = invitation.rejectedAt ?? undefined;
    model.createdAt = invitation.createdAt;
    model.updatedAt = invitation.updatedAt;
    return model;
  }
}
