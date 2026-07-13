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
import { MembershipService } from './application/services/membership.service';
import { MembershipAccessService } from './application/services/membership-access.service';
import { MembershipUserProfileProjectionService } from './application/services/membership-user-profile-projection.service';
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
    MembershipService,
    MembershipAccessService,
    MembershipUserProfileProjectionService,
    MembershipResolver,
  ],
  exports: [MembershipService, MembershipAccessService],
})
export class MembershipModule {}
