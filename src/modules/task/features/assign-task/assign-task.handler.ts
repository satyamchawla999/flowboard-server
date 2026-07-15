import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@modules/project/domain/contracts/project.repository';
import { ProjectNotFoundError } from '@modules/project/domain/errors/project.errors';
import { ITaskRepository, TASK_REPOSITORY } from '../../domain/contracts/task.repository';
import { TaskNotFoundError } from '../../domain/errors/task.errors';
import { Task } from '../../domain/models/task.model';
import { TaskAccessService } from '../../infrastructure/services/task-access.service';
import { TaskDomainEventDispatcherService } from '../../infrastructure/services/task-domain-event-dispatcher.service';
import type { AssignTaskDto } from './assign-task.dto';

@Injectable()
export class AssignTaskHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    private readonly taskAccess: TaskAccessService,
    private readonly eventDispatcher: TaskDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: AssignTaskDto): Promise<Task> {
    const task = await this.taskRepository.findById(dto.taskId);
    if (!task) throw new TaskNotFoundError(dto.taskId);
    const project = await this.projectRepository.findById(task.projectId);
    if (!project) throw new ProjectNotFoundError(task.projectId);
    await this.taskAccess.ensureCanAssignTask(actorUserId, project, task);
    await this.taskAccess.ensureEligibleAssignee(dto.assigneeUserId, project);
    project.updateDetails({}, actorUserId);
    project.pullDomainEvents();
    task.assign(dto.assigneeUserId, actorUserId);
    await this.taskRepository.save(task);
    await this.eventDispatcher.dispatchAggregateEvents(task);
    return task;
  }
}
