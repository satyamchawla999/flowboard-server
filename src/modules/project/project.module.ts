import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MembershipModule } from '@modules/membership/membership.module';
import { ProjectEntity } from './infrastructure/persistence/mikro-orm/entities/project.entity';
import { ProjectMemberEntity } from './infrastructure/persistence/mikro-orm/entities/project-member.entity';
import { ProjectSectionEntity } from './infrastructure/persistence/mikro-orm/entities/project-section.entity';
import { ProjectUserProfileEntity } from './infrastructure/persistence/mikro-orm/entities/project-user-profile.entity';
import { ProjectMapper } from './infrastructure/persistence/mikro-orm/mappers/project.mapper';
import { ProjectMemberMapper } from './infrastructure/persistence/mikro-orm/mappers/project-member.mapper';
import { ProjectSectionMapper } from './infrastructure/persistence/mikro-orm/mappers/project-section.mapper';
import { ProjectUserProfileMapper } from './infrastructure/persistence/mikro-orm/mappers/project-user-profile.mapper';
import { ProjectMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/project.mikro-orm.repository';
import { ProjectMemberMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/project-member.mikro-orm.repository';
import { ProjectSectionMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/project-section.mikro-orm.repository';
import { ProjectUserProfileMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/project-user-profile.mikro-orm.repository';
import { PROJECT_REPOSITORY } from './domain/contracts/project.repository';
import { PROJECT_MEMBER_REPOSITORY } from './domain/contracts/project-member.repository';
import { PROJECT_SECTION_REPOSITORY } from './domain/contracts/project-section.repository';
import { PROJECT_USER_PROFILE_REPOSITORY } from './domain/contracts/project-user-profile.repository';
import { ProjectAccessService } from './infrastructure/services/project-access.service';
import { ProjectDomainEventDispatcherService } from './infrastructure/services/project-domain-event-dispatcher.service';
import { ProjectSectionPositionService } from './infrastructure/services/project-section-position.service';
import { ProjectUserProfileProjectionService } from './infrastructure/services/project-user-profile-projection.service';
import { CreateProjectHandler } from './features/create-project/create-project.handler';
import { GetProjectHandler } from './features/get-project/get-project.handler';
import { ListWorkspaceProjectsHandler } from './features/list-workspace-projects/list-workspace-projects.handler';
import { UpdateProjectDetailsHandler } from './features/update-project-details/update-project-details.handler';
import { UpdateProjectHealthHandler } from './features/update-project-health/update-project-health.handler';
import { UpdateProjectDatesHandler } from './features/update-project-dates/update-project-dates.handler';
import { ArchiveProjectHandler } from './features/archive-project/archive-project.handler';
import { RestoreProjectHandler } from './features/restore-project/restore-project.handler';
import { DeleteProjectHandler } from './features/delete-project/delete-project.handler';
import { ListProjectMembersHandler } from './features/list-project-members/list-project-members.handler';
import { AddProjectMemberHandler } from './features/add-project-member/add-project-member.handler';
import { RemoveProjectMemberHandler } from './features/remove-project-member/remove-project-member.handler';
import { TransferProjectOwnershipHandler } from './features/transfer-project-ownership/transfer-project-ownership.handler';
import { CreateProjectSectionHandler } from './features/create-project-section/create-project-section.handler';
import { GetProjectSectionHandler } from './features/get-project-section/get-project-section.handler';
import { ListProjectSectionsHandler } from './features/list-project-sections/list-project-sections.handler';
import { RenameProjectSectionHandler } from './features/rename-project-section/rename-project-section.handler';
import { ReorderProjectSectionHandler } from './features/reorder-project-section/reorder-project-section.handler';
import { DeleteProjectSectionHandler } from './features/delete-project-section/delete-project-section.handler';
import { RestoreProjectSectionHandler } from './features/restore-project-section/restore-project-section.handler';
import { ProjectResolver } from './presentation/graphql/resolvers/project.resolver';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProjectEntity,
      ProjectMemberEntity,
      ProjectSectionEntity,
      ProjectUserProfileEntity,
    ]),
    MembershipModule,
  ],
  providers: [
    ProjectMapper,
    ProjectMemberMapper,
    ProjectSectionMapper,
    ProjectUserProfileMapper,
    { provide: PROJECT_REPOSITORY, useClass: ProjectMikroOrmRepository },
    { provide: PROJECT_MEMBER_REPOSITORY, useClass: ProjectMemberMikroOrmRepository },
    { provide: PROJECT_SECTION_REPOSITORY, useClass: ProjectSectionMikroOrmRepository },
    { provide: PROJECT_USER_PROFILE_REPOSITORY, useClass: ProjectUserProfileMikroOrmRepository },
    ProjectAccessService,
    ProjectDomainEventDispatcherService,
    ProjectSectionPositionService,
    ProjectUserProfileProjectionService,
    CreateProjectHandler,
    GetProjectHandler,
    ListWorkspaceProjectsHandler,
    UpdateProjectDetailsHandler,
    UpdateProjectHealthHandler,
    UpdateProjectDatesHandler,
    ArchiveProjectHandler,
    RestoreProjectHandler,
    DeleteProjectHandler,
    ListProjectMembersHandler,
    AddProjectMemberHandler,
    RemoveProjectMemberHandler,
    TransferProjectOwnershipHandler,
    CreateProjectSectionHandler,
    GetProjectSectionHandler,
    ListProjectSectionsHandler,
    RenameProjectSectionHandler,
    ReorderProjectSectionHandler,
    DeleteProjectSectionHandler,
    RestoreProjectSectionHandler,
    ProjectResolver,
  ],
})
export class ProjectModule {}
