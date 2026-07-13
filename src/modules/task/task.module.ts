import { forwardRef, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProjectModule } from '@modules/project/project.module';
import { TASK_REPOSITORY } from './domain/contracts/task.repository';
import { TASK_SECTION_USAGE_SERVICE } from './domain/contracts/task-section-usage.service';
import { TaskEntity } from './infrastructure/persistence/mikro-orm/entities/task.entity';
import { TaskMapper } from './infrastructure/persistence/mikro-orm/mappers/task.mapper';
import { TaskMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/task.mikro-orm.repository';
import { ProjectListViewQueryService } from './infrastructure/services/project-list-view-query.service';
import { TaskAccessService } from './infrastructure/services/task-access.service';
import { TaskDomainEventDispatcherService } from './infrastructure/services/task-domain-event-dispatcher.service';
import { TaskPositionService } from './infrastructure/services/task-position.service';
import { TaskSectionUsageService } from './infrastructure/services/task-section-usage.service';
import { AssignTaskHandler } from './features/assign-task/assign-task.handler';
import { ChangeTaskPriorityHandler } from './features/change-task-priority/change-task-priority.handler';
import { CompleteTaskHandler } from './features/complete-task/complete-task.handler';
import { CreateTaskHandler } from './features/create-task/create-task.handler';
import { DeleteTaskHandler } from './features/delete-task/delete-task.handler';
import { GetProjectListViewHandler } from './features/get-project-list-view/get-project-list-view.handler';
import { GetTaskHandler } from './features/get-task/get-task.handler';
import { ListMyAssignedTasksHandler } from './features/list-my-assigned-tasks/list-my-assigned-tasks.handler';
import { ListProjectTasksHandler } from './features/list-project-tasks/list-project-tasks.handler';
import { MoveTaskToSectionHandler } from './features/move-task-to-section/move-task-to-section.handler';
import { ReopenTaskHandler } from './features/reopen-task/reopen-task.handler';
import { ReorderTaskHandler } from './features/reorder-task/reorder-task.handler';
import { SetTaskDueDateHandler } from './features/set-task-due-date/set-task-due-date.handler';
import { UnassignTaskHandler } from './features/unassign-task/unassign-task.handler';
import { UpdateTaskDetailsHandler } from './features/update-task-details/update-task-details.handler';
import { TaskResolver } from './presentation/graphql/resolvers/task.resolver';

@Module({
  imports: [MikroOrmModule.forFeature([TaskEntity]), forwardRef(() => ProjectModule)],
  providers: [
    TaskMapper,
    { provide: TASK_REPOSITORY, useClass: TaskMikroOrmRepository },
    { provide: TASK_SECTION_USAGE_SERVICE, useClass: TaskSectionUsageService },
    ProjectListViewQueryService,
    TaskAccessService,
    TaskDomainEventDispatcherService,
    TaskPositionService,
    AssignTaskHandler,
    ChangeTaskPriorityHandler,
    CompleteTaskHandler,
    CreateTaskHandler,
    DeleteTaskHandler,
    GetProjectListViewHandler,
    GetTaskHandler,
    ListMyAssignedTasksHandler,
    ListProjectTasksHandler,
    MoveTaskToSectionHandler,
    ReopenTaskHandler,
    ReorderTaskHandler,
    SetTaskDueDateHandler,
    UnassignTaskHandler,
    UpdateTaskDetailsHandler,
    TaskResolver,
  ],
  exports: [TASK_REPOSITORY, TASK_SECTION_USAGE_SERVICE],
})
export class TaskModule {}
