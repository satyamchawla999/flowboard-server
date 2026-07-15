import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@modules/project/domain/contracts/project.repository';
import { ProjectNotFoundError } from '@modules/project/domain/errors/project.errors';
import { ITaskRepository, TASK_REPOSITORY } from '../../domain/contracts/task.repository';
import { TaskNotFoundError } from '../../domain/errors/task.errors';
import { TaskAccessService } from '../../infrastructure/services/task-access.service';
import { TaskDomainEventDispatcherService } from '../../infrastructure/services/task-domain-event-dispatcher.service';

@Injectable()
export class DeleteTaskHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    private readonly taskAccess: TaskAccessService,
    private readonly eventDispatcher: TaskDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, taskId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new TaskNotFoundError(taskId);
    const project = await this.projectRepository.findById(task.projectId);
    if (!project) throw new ProjectNotFoundError(task.projectId);
    await this.taskAccess.ensureCanDeleteTask(actorUserId, project);
    project.updateDetails({}, actorUserId);
    project.pullDomainEvents();
    task.softDelete(actorUserId);
    await this.taskRepository.save(task);
    await this.eventDispatcher.dispatchAggregateEvents(task);
  }
}
