import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from '@common/decorators/current-user.decorator';
import { MembershipService } from '../../../application/services/membership.service';
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
    private readonly membershipService: MembershipService,
    @Inject(MEMBERSHIP_USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IMembershipUserProfileRepository,
  ) {}

  @Mutation(() => WorkspaceInvitationGqlModel)
  async inviteWorkspaceMember(
    @Args('input') input: InviteWorkspaceMemberInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceInvitationGqlModel> {
    const invitation = await this.membershipService.inviteMember(user.id, {
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
    const member = await this.membershipService.acceptInvitation(user.id, user.email, token);
    return this.toMemberGql(member);
  }

  @Mutation(() => WorkspaceInvitationGqlModel)
  async rejectWorkspaceInvitation(
    @Args('token') token: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceInvitationGqlModel> {
    const invitation = await this.membershipService.rejectInvitation(user.email, token);
    return this.toInvitationGql(invitation);
  }

  @Mutation(() => WorkspaceInvitationGqlModel)
  async cancelWorkspaceInvitation(
    @Args('invitationId', { type: () => ID }) invitationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceInvitationGqlModel> {
    const invitation = await this.membershipService.cancelInvitation(user.id, invitationId);
    return this.toInvitationGql(invitation);
  }

  @Query(() => [WorkspaceMemberGqlModel])
  async workspaceMembers(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceMemberGqlModel[]> {
    const members = await this.membershipService.listWorkspaceMembers(user.id, workspaceId);
    return Promise.all(members.map((member) => this.toMemberGql(member, true)));
  }

  @Query(() => [WorkspaceInvitationGqlModel])
  async workspaceInvitations(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceInvitationGqlModel[]> {
    const invitations = await this.membershipService.listPendingInvitations(user.id, workspaceId);
    return invitations.map((invitation) => this.toInvitationGql(invitation));
  }

  @Mutation(() => WorkspaceMemberGqlModel)
  async changeWorkspaceMemberRole(
    @Args('input') input: ChangeWorkspaceMemberRoleInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceMemberGqlModel> {
    const member = await this.membershipService.changeMemberRole(user.id, {
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
    await this.membershipService.removeMember(user.id, {
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
    await this.membershipService.leaveWorkspace(user.id, workspaceId);
    return true;
  }

  @Mutation(() => WorkspaceMemberGqlModel)
  async transferWorkspaceOwnership(
    @Args('input') input: TransferWorkspaceOwnershipInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceMemberGqlModel> {
    const member = await this.membershipService.transferOwnership(user.id, {
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
