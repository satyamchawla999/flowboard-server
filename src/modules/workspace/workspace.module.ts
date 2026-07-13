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
import { WorkspaceService } from './application/services/workspace.service';
import { WorkspaceUserProfileProjectionService } from './application/services/workspace-user-profile-projection.service';
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
    WorkspaceService,
    WorkspaceUserProfileProjectionService,
    WorkspaceResolver,
  ],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
