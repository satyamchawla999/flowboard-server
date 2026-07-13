import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser, type AuthenticatedUser } from '@common/decorators/current-user.decorator';
import { Task } from '../../../domain/models/task.model';
import { ProjectListViewReadModel } from '../../../domain/read-models/project-list-view.read-model';
import { AssignTaskHandler } from '../../../features/assign-task/assign-task.handler';
import { ChangeTaskPriorityHandler } from '../../../features/change-task-priority/change-task-priority.handler';
import { CompleteTaskHandler } from '../../../features/complete-task/complete-task.handler';
import { CreateTaskHandler } from '../../../features/create-task/create-task.handler';
import { DeleteTaskHandler } from '../../../features/delete-task/delete-task.handler';
import { GetProjectListViewHandler } from '../../../features/get-project-list-view/get-project-list-view.handler';
import { GetTaskHandler } from '../../../features/get-task/get-task.handler';
import { ListMyAssignedTasksHandler } from '../../../features/list-my-assigned-tasks/list-my-assigned-tasks.handler';
import { ListProjectTasksHandler } from '../../../features/list-project-tasks/list-project-tasks.handler';
import { MoveTaskToSectionHandler } from '../../../features/move-task-to-section/move-task-to-section.handler';
import { ReopenTaskHandler } from '../../../features/reopen-task/reopen-task.handler';
import { ReorderTaskHandler } from '../../../features/reorder-task/reorder-task.handler';
import { SetTaskDueDateHandler } from '../../../features/set-task-due-date/set-task-due-date.handler';
import { UnassignTaskHandler } from '../../../features/unassign-task/unassign-task.handler';
import { UpdateTaskDetailsHandler } from '../../../features/update-task-details/update-task-details.handler';
import { AssignTaskInput } from '../inputs/assign-task.input';
import { ChangeTaskPriorityInput } from '../inputs/change-task-priority.input';
import { CreateTaskInput } from '../inputs/create-task.input';
import { ListMyAssignedTasksInput } from '../inputs/list-my-assigned-tasks.input';
import { ListProjectTasksInput } from '../inputs/list-project-tasks.input';
import { MoveTaskToSectionInput } from '../inputs/move-task-to-section.input';
import { ReorderTaskInput } from '../inputs/reorder-task.input';
import { SetTaskDueDateInput } from '../inputs/set-task-due-date.input';
import { UpdateTaskDetailsInput } from '../inputs/update-task-details.input';
import {
  ProjectListViewGqlModel,
  ProjectListViewSectionGqlModel,
  ProjectListViewTaskGqlModel,
  TaskGqlModel,
  TaskUserGqlModel,
} from '../models/task.model';

@Resolver(() => TaskGqlModel)
export class TaskResolver {
  constructor(
    private readonly createTaskHandler: CreateTaskHandler,
    private readonly getTaskHandler: GetTaskHandler,
    private readonly listProjectTasksHandler: ListProjectTasksHandler,
    private readonly listMyAssignedTasksHandler: ListMyAssignedTasksHandler,
    private readonly updateTaskDetailsHandler: UpdateTaskDetailsHandler,
    private readonly assignTaskHandler: AssignTaskHandler,
    private readonly unassignTaskHandler: UnassignTaskHandler,
    private readonly changeTaskPriorityHandler: ChangeTaskPriorityHandler,
    private readonly setTaskDueDateHandler: SetTaskDueDateHandler,
    private readonly completeTaskHandler: CompleteTaskHandler,
    private readonly reopenTaskHandler: ReopenTaskHandler,
    private readonly moveTaskToSectionHandler: MoveTaskToSectionHandler,
    private readonly reorderTaskHandler: ReorderTaskHandler,
    private readonly deleteTaskHandler: DeleteTaskHandler,
    private readonly getProjectListViewHandler: GetProjectListViewHandler,
  ) {}

  @Query(() => TaskGqlModel)
  async task(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    return this.toTaskGql(await this.getTaskHandler.execute(user.id, id));
  }

  @Query(() => [TaskGqlModel])
  async projectTasks(
    @Args('input') input: ListProjectTasksInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel[]> {
    const tasks = await this.listProjectTasksHandler.execute(user.id, input);
    return tasks.map((task) => this.toTaskGql(task));
  }

  @Query(() => [TaskGqlModel])
  async myAssignedTasks(
    @Args('input', { nullable: true }) input: ListMyAssignedTasksInput | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel[]> {
    const tasks = await this.listMyAssignedTasksHandler.execute(user.id, input ?? {});
    return tasks.map((task) => this.toTaskGql(task));
  }

  @Query(() => ProjectListViewGqlModel)
  async projectListView(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectListViewGqlModel> {
    return this.toListViewGql(await this.getProjectListViewHandler.execute(user.id, projectId));
  }

  @Mutation(() => TaskGqlModel)
  async createTask(
    @Args('input') input: CreateTaskInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    return this.toTaskGql(await this.createTaskHandler.execute(user.id, input));
  }

  @Mutation(() => TaskGqlModel)
  async updateTaskDetails(
    @Args('input') input: UpdateTaskDetailsInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    return this.toTaskGql(await this.updateTaskDetailsHandler.execute(user.id, input));
  }

  @Mutation(() => TaskGqlModel)
  async assignTask(
    @Args('input') input: AssignTaskInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    return this.toTaskGql(await this.assignTaskHandler.execute(user.id, input));
  }

  @Mutation(() => TaskGqlModel)
  async unassignTask(
    @Args('taskId', { type: () => ID }) taskId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    return this.toTaskGql(await this.unassignTaskHandler.execute(user.id, taskId));
  }

  @Mutation(() => TaskGqlModel)
  async changeTaskPriority(
    @Args('input') input: ChangeTaskPriorityInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    return this.toTaskGql(await this.changeTaskPriorityHandler.execute(user.id, input));
  }

  @Mutation(() => TaskGqlModel)
  async setTaskDueDate(
    @Args('input') input: SetTaskDueDateInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    return this.toTaskGql(await this.setTaskDueDateHandler.execute(user.id, input));
  }

  @Mutation(() => TaskGqlModel)
  async completeTask(
    @Args('taskId', { type: () => ID }) taskId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    return this.toTaskGql(await this.completeTaskHandler.execute(user.id, taskId));
  }

  @Mutation(() => TaskGqlModel)
  async reopenTask(
    @Args('taskId', { type: () => ID }) taskId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    return this.toTaskGql(await this.reopenTaskHandler.execute(user.id, taskId));
  }

  @Mutation(() => TaskGqlModel)
  async moveTaskToSection(
    @Args('input') input: MoveTaskToSectionInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    return this.toTaskGql(await this.moveTaskToSectionHandler.execute(user.id, input));
  }

  @Mutation(() => TaskGqlModel)
  async reorderTask(
    @Args('input') input: ReorderTaskInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    return this.toTaskGql(await this.reorderTaskHandler.execute(user.id, input));
  }

  @Mutation(() => Boolean)
  async deleteTask(
    @Args('taskId', { type: () => ID }) taskId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.deleteTaskHandler.execute(user.id, taskId);
    return true;
  }

  private toTaskGql(task: Task): TaskGqlModel {
    const model = new TaskGqlModel();
    model.id = task.id;
    model.workspaceId = task.workspaceId;
    model.projectId = task.projectId;
    model.sectionId = task.sectionId;
    model.title = task.title;
    model.description = task.description ?? undefined;
    model.assigneeUserId = task.assigneeUserId ?? undefined;
    model.reporterUserId = task.reporterUserId;
    model.priority = task.priority.value;
    model.lifecycleStatus = task.lifecycleStatus.value;
    model.dueDate = task.dueDate ?? undefined;
    model.position = task.position;
    model.completedAt = task.completedAt ?? undefined;
    model.createdAt = task.createdAt;
    model.updatedAt = task.updatedAt;
    return model;
  }

  private toListViewGql(view: ProjectListViewReadModel): ProjectListViewGqlModel {
    return {
      project: {
        id: view.project.id,
        name: view.project.name,
        key: view.project.key,
        healthStatus: view.project.healthStatus,
      },
      sections: view.sections.map((section) => {
        const gqlSection = new ProjectListViewSectionGqlModel();
        gqlSection.id = section.id;
        gqlSection.name = section.name;
        gqlSection.position = section.position;
        gqlSection.tasks = section.tasks.map((task) => {
          const gqlTask = Object.assign(new ProjectListViewTaskGqlModel(), {
            ...task,
            description: task.description ?? undefined,
            dueDate: task.dueDate ?? undefined,
            completedAt: task.completedAt ?? undefined,
            assignee: task.assignee
              ? Object.assign(new TaskUserGqlModel(), task.assignee)
              : undefined,
            reporter: task.reporter
              ? Object.assign(new TaskUserGqlModel(), task.reporter)
              : undefined,
          });
          return gqlTask;
        });
        return gqlSection;
      }),
    };
  }
}
