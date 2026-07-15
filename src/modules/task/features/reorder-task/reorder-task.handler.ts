import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@modules/project/domain/contracts/project.repository';
import { ProjectNotFoundError } from '@modules/project/domain/errors/project.errors';
import { ITaskRepository, TASK_REPOSITORY } from '../../domain/contracts/task.repository';
import {
  TaskNotFoundError,
  TaskPositionInvalidError,
  TaskSectionMismatchError,
} from '../../domain/errors/task.errors';
import { Task } from '../../domain/models/task.model';
import { TaskAccessService } from '../../infrastructure/services/task-access.service';
import { TaskDomainEventDispatcherService } from '../../infrastructure/services/task-domain-event-dispatcher.service';
import { TaskPositionService } from '../../infrastructure/services/task-position.service';
import type { ReorderTaskDto } from './reorder-task.dto';

@Injectable()
export class ReorderTaskHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    private readonly taskAccess: TaskAccessService,
    private readonly positionService: TaskPositionService,
    private readonly eventDispatcher: TaskDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: ReorderTaskDto): Promise<Task> {
    const task = await this.taskRepository.findById(dto.taskId);
    if (!task) throw new TaskNotFoundError(dto.taskId);
    const project = await this.projectRepository.findById(task.projectId);
    if (!project) throw new ProjectNotFoundError(task.projectId);
    await this.taskAccess.ensureCanUpdateTask(actorUserId, project, task);
    project.updateDetails({}, actorUserId);
    project.pullDomainEvents();
    const position = await this.calculatePosition(task, dto.beforeTaskId, dto.afterTaskId);
    task.reorder(position, actorUserId);
    await this.taskRepository.save(task);
    await this.eventDispatcher.dispatchAggregateEvents(task);
    return task;
  }

  private async calculatePosition(
    task: Task,
    beforeTaskId?: string,
    afterTaskId?: string,
  ): Promise<number> {
    if (beforeTaskId && afterTaskId && beforeTaskId === afterTaskId) {
      throw new TaskPositionInvalidError();
    }
    const before = beforeTaskId ? await this.taskRepository.findById(beforeTaskId) : null;
    const after = afterTaskId ? await this.taskRepository.findById(afterTaskId) : null;
    if (beforeTaskId && !before) throw new TaskNotFoundError(beforeTaskId);
    if (afterTaskId && !after) throw new TaskNotFoundError(afterTaskId);
    if (before && (before.projectId !== task.projectId || before.sectionId !== task.sectionId)) {
      throw new TaskSectionMismatchError();
    }
    if (after && (after.projectId !== task.projectId || after.sectionId !== task.sectionId)) {
      throw new TaskSectionMismatchError();
    }
    if (this.positionService.needsRebalance(after, before)) {
      const tasks = await this.taskRepository.listBySection(task.projectId, task.sectionId);
      this.positionService.rebalance(tasks);
      await this.taskRepository.saveMany(tasks);
      return this.calculatePosition(task, beforeTaskId, afterTaskId);
    }
    return this.positionService.between(after, before);
  }
}
