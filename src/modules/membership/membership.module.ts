import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { WorkspaceMemberEntity } from './infrastructure/persistence/mikro-orm/entities/workspace-member.entity';
import { WorkspaceInvitationEntity } from './infrastructure/persistence/mikro-orm/entities/workspace-invitation.entity';
import { MembershipUserProfileEntity } from './infrastructure/persistence/mikro-orm/entities/membership-user-profile.entity';
import { WorkspaceMemberMapper } from './infrastructure/persistence/mikro-orm/mappers/workspace-member.mapper';
import { WorkspaceInvitationMapper } from './infrastructure/persistence/mikro-orm/mappers/workspace-invitation.mapper';
import { MembershipUserProfileMapper } from './infrastructure/persistence/mikro-orm/mappers/membership-user-profile.mapper';
import { WorkspaceMemberMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/workspace-member.mikro-orm.repository';
import { WorkspaceInvitationMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/workspace-invitation.mikro-orm.repository';
import { MembershipUserProfileMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/membership-user-profile.mikro-orm.repository';
import { WORKSPACE_MEMBER_REPOSITORY } from './domain/contracts/workspace-member.repository';
import { WORKSPACE_INVITATION_REPOSITORY } from './domain/contracts/workspace-invitation.repository';
import { MEMBERSHIP_USER_PROFILE_REPOSITORY } from './domain/contracts/membership-user-profile.repository';
import { MembershipPolicyService } from './infrastructure/services/membership-policy.service';
import { MembershipAccessService } from './infrastructure/services/membership-access.service';
import { WorkspaceInvitationAccessService } from './infrastructure/services/workspace-invitation-access.service';
import { MembershipUserProfileProjectionService } from './infrastructure/services/membership-user-profile-projection.service';
import { InviteWorkspaceMemberHandler } from './features/invite-workspace-member/invite-workspace-member.handler';
import { AcceptWorkspaceInvitationHandler } from './features/accept-workspace-invitation/accept-workspace-invitation.handler';
import { RejectWorkspaceInvitationHandler } from './features/reject-workspace-invitation/reject-workspace-invitation.handler';
import { CancelWorkspaceInvitationHandler } from './features/cancel-workspace-invitation/cancel-workspace-invitation.handler';
import { ListWorkspaceMembersHandler } from './features/list-workspace-members/list-workspace-members.handler';
import { ListWorkspaceInvitationsHandler } from './features/list-workspace-invitations/list-workspace-invitations.handler';
import { ChangeWorkspaceMemberRoleHandler } from './features/change-workspace-member-role/change-workspace-member-role.handler';
import { RemoveWorkspaceMemberHandler } from './features/remove-workspace-member/remove-workspace-member.handler';
import { LeaveWorkspaceHandler } from './features/leave-workspace/leave-workspace.handler';
import { TransferWorkspaceOwnershipHandler } from './features/transfer-workspace-ownership/transfer-workspace-ownership.handler';
import { HandleWorkspaceCreatedHandler } from './features/handle-workspace-created/handle-workspace-created.handler';
import { MembershipResolver } from './presentation/graphql/resolvers/membership.resolver';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      WorkspaceMemberEntity,
      WorkspaceInvitationEntity,
      MembershipUserProfileEntity,
    ]),
  ],
  providers: [
    WorkspaceMemberMapper,
    WorkspaceInvitationMapper,
    MembershipUserProfileMapper,
    {
      provide: WORKSPACE_MEMBER_REPOSITORY,
      useClass: WorkspaceMemberMikroOrmRepository,
    },
    {
      provide: WORKSPACE_INVITATION_REPOSITORY,
      useClass: WorkspaceInvitationMikroOrmRepository,
    },
    {
      provide: MEMBERSHIP_USER_PROFILE_REPOSITORY,
      useClass: MembershipUserProfileMikroOrmRepository,
    },
    MembershipPolicyService,
    MembershipAccessService,
    WorkspaceInvitationAccessService,
    MembershipUserProfileProjectionService,
    InviteWorkspaceMemberHandler,
    AcceptWorkspaceInvitationHandler,
    RejectWorkspaceInvitationHandler,
    CancelWorkspaceInvitationHandler,
    ListWorkspaceMembersHandler,
    ListWorkspaceInvitationsHandler,
    ChangeWorkspaceMemberRoleHandler,
    RemoveWorkspaceMemberHandler,
    LeaveWorkspaceHandler,
    TransferWorkspaceOwnershipHandler,
    HandleWorkspaceCreatedHandler,
    MembershipResolver,
  ],
  exports: [MembershipAccessService],
})
export class MembershipModule {}
