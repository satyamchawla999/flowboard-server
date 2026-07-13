import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { TaskService } from '../../../application/services/task.service';
import { TaskGqlModel } from '../models/task.model';
import { CreateTaskInput } from '../inputs/create-task.input';
import { ChangeTaskStatusInput } from '../inputs/change-task-status.input';
import { CurrentUser, type AuthenticatedUser } from '@common/decorators/current-user.decorator';
import { Task } from '../../../domain/models/task.model';

/**
 * Resolver — presentation boundary. Thin by design.
 *
 * Responsibilities:
 *   1. Deserialize input (GraphQL Input → DTO)
 *   2. Call the application service
 *   3. Map the result to the GraphQL model
 *
 * No business logic here. No domain decisions here.
 * If a resolver grows beyond these three steps, something is misplaced.
 */
@Resolver(() => TaskGqlModel)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Query(() => TaskGqlModel, { name: 'task' })
  async getTask(@Args('id', { type: () => ID }) id: string): Promise<TaskGqlModel> {
    const task = await this.taskService.getTask(id);
    return this.toGql(task);
  }

  @Query(() => [TaskGqlModel], { name: 'tasksByProject' })
  async getTasksByProject(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<TaskGqlModel[]> {
    const tasks = await this.taskService.getTasksByProject(projectId);
    return tasks.map((t) => this.toGql(t));
  }

  @Mutation(() => TaskGqlModel)
  async createTask(
    @Args('input') input: CreateTaskInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    const task = await this.taskService.createTask({
      title: input.title,
      projectId: input.projectId,
      createdById: user.id,
      description: input.description,
      priority: input.priority,
    });
    return this.toGql(task);
  }

  @Mutation(() => TaskGqlModel)
  async changeTaskStatus(
    @Args('input') input: ChangeTaskStatusInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskGqlModel> {
    const task = await this.taskService.changeTaskStatus({
      taskId: input.taskId,
      newStatus: input.newStatus,
      changedById: user.id,
    });
    return this.toGql(task);
  }

  @Mutation(() => Boolean)
  async deleteTask(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.taskService.deleteTask(id);
    return true;
  }

  private toGql(task: Task): TaskGqlModel {
    const model = new TaskGqlModel();
    model.id = task.id;
    model.title = task.title;
    model.description = task.description ?? undefined;
    model.projectId = task.projectId;
    model.assigneeId = task.assigneeId ?? undefined;
    model.createdById = task.createdById;
    model.status = task.status.value;
    model.priority = task.priority.value;
    model.createdAt = task.createdAt;
    model.updatedAt = task.updatedAt;
    return model;
  }
}
