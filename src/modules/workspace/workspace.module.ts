import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { WorkspaceEntity } from './infrastructure/persistence/mikro-orm/entities/workspace.entity';
import { WorkspaceUserProfileEntity } from './infrastructure/persistence/mikro-orm/entities/workspace-user-profile.entity';
import { WorkspaceMapper } from './infrastructure/persistence/mikro-orm/mappers/workspace.mapper';
import { WorkspaceUserProfileMapper } from './infrastructure/persistence/mikro-orm/mappers/workspace-user-profile.mapper';
import { WorkspaceMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/workspace.mikro-orm.repository';
import { WorkspaceUserProfileMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/workspace-user-profile.mikro-orm.repository';
import { WORKSPACE_REPOSITORY } from './domain/contracts/workspace.repository';
import { WORKSPACE_USER_PROFILE_REPOSITORY } from './domain/contracts/workspace-user-profile.repository';
import { WorkspaceAccessService } from './infrastructure/services/workspace-access.service';
import { WorkspaceDomainEventDispatcherService } from './infrastructure/services/workspace-domain-event-dispatcher.service';
import { WorkspaceUserProfileProjectionService } from './infrastructure/services/workspace-user-profile-projection.service';
import { CreateWorkspaceHandler } from './features/create-workspace/create-workspace.handler';
import { GetWorkspaceHandler } from './features/get-workspace/get-workspace.handler';
import { ListMyWorkspacesHandler } from './features/list-my-workspaces/list-my-workspaces.handler';
import { UpdateWorkspaceHandler } from './features/update-workspace/update-workspace.handler';
import { UpdateWorkspacePreferencesHandler } from './features/update-workspace-preferences/update-workspace-preferences.handler';
import { ArchiveWorkspaceHandler } from './features/archive-workspace/archive-workspace.handler';
import { RestoreWorkspaceHandler } from './features/restore-workspace/restore-workspace.handler';
import { DeleteWorkspaceHandler } from './features/delete-workspace/delete-workspace.handler';
import { WorkspaceResolver } from './presentation/graphql/resolvers/workspace.resolver';

/**
 * WorkspaceModule wires the Workspace DDD boundaries.
 * User account state is consumed through a local projection, not IdentityModule.
 */
@Module({
  imports: [MikroOrmModule.forFeature([WorkspaceEntity, WorkspaceUserProfileEntity])],
  providers: [
    WorkspaceMapper,
    WorkspaceUserProfileMapper,
    {
      provide: WORKSPACE_REPOSITORY,
      useClass: WorkspaceMikroOrmRepository,
    },
    {
      provide: WORKSPACE_USER_PROFILE_REPOSITORY,
      useClass: WorkspaceUserProfileMikroOrmRepository,
    },
    WorkspaceAccessService,
    WorkspaceDomainEventDispatcherService,
    WorkspaceUserProfileProjectionService,
    CreateWorkspaceHandler,
    GetWorkspaceHandler,
    ListMyWorkspacesHandler,
    UpdateWorkspaceHandler,
    UpdateWorkspacePreferencesHandler,
    ArchiveWorkspaceHandler,
    RestoreWorkspaceHandler,
    DeleteWorkspaceHandler,
    WorkspaceResolver,
  ],
})
export class WorkspaceModule {}
