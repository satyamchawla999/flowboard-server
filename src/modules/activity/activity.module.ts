import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MembershipModule } from '@modules/membership/membership.module';
import { ProjectModule } from '@modules/project/project.module';
import { TaskModule } from '@modules/task/task.module';
import { ACTIVITY_REPOSITORY } from './domain/contracts/activity.repository';
import { ListProjectActivityHandler } from './features/list-project-activity/list-project-activity.handler';
import { ListTaskActivityHandler } from './features/list-task-activity/list-task-activity.handler';
import { ListWorkspaceActivityHandler } from './features/list-workspace-activity/list-workspace-activity.handler';
import { ActivityEntity } from './infrastructure/persistence/mikro-orm/entities/activity.entity';
import { ActivityMapper } from './infrastructure/persistence/mikro-orm/mappers/activity.mapper';
import { ActivityMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/activity.mikro-orm.repository';
import { ProjectActivityProjectionListener } from './infrastructure/projections/project-activity-projection.listener';
import { ProjectSectionActivityProjectionListener } from './infrastructure/projections/project-section-activity-projection.listener';
import { TaskActivityProjectionListener } from './infrastructure/projections/task-activity-projection.listener';
import { ActivityAppendService } from './infrastructure/services/activity-append.service';
import { ActivityCursorService } from './infrastructure/services/activity-cursor.service';
import { ActivityFeedService } from './infrastructure/services/activity-feed.service';
import { ActivityResolver } from './presentation/graphql/resolvers/activity.resolver';

@Module({
  imports: [
    MikroOrmModule.forFeature([ActivityEntity]),
    MembershipModule,
    ProjectModule,
    TaskModule,
  ],
  providers: [
    ActivityMapper,
    { provide: ACTIVITY_REPOSITORY, useClass: ActivityMikroOrmRepository },
    ActivityAppendService,
    ActivityCursorService,
    ActivityFeedService,
    ProjectActivityProjectionListener,
    ProjectSectionActivityProjectionListener,
    TaskActivityProjectionListener,
    ListWorkspaceActivityHandler,
    ListProjectActivityHandler,
    ListTaskActivityHandler,
    ActivityResolver,
  ],
})
export class ActivityModule {}
