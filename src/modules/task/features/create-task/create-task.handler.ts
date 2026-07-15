import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@modules/project/domain/contracts/project.repository';
import {
  IProjectSectionRepository,
  PROJECT_SECTION_REPOSITORY,
} from '@modules/project/domain/contracts/project-section.repository';
import { ProjectNotFoundError } from '@modules/project/domain/errors/project.errors';
import { ProjectSectionNotFoundError } from '@modules/project/domain/errors/project-section.errors';
import { Task } from '../../domain/models/task.model';
import { ITaskRepository, TASK_REPOSITORY } from '../../domain/contracts/task.repository';
import {
  TaskNotFoundError,
  TaskPositionInvalidError,
  TaskProjectMismatchError,
  TaskSectionMismatchError,
} from '../../domain/errors/task.errors';
import { TaskPriority } from '../../domain/value-objects/task-priority.vo';
import { TaskAccessService } from '../../infrastructure/services/task-access.service';
import { TaskDomainEventDispatcherService } from '../../infrastructure/services/task-domain-event-dispatcher.service';
import { TaskPositionService } from '../../infrastructure/services/task-position.service';
import type { CreateTaskDto } from './create-task.dto';

@Injectable()
export class CreateTaskHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_SECTION_REPOSITORY)
    private readonly sectionRepository: IProjectSectionRepository,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    private readonly taskAccess: TaskAccessService,
    private readonly positionService: TaskPositionService,
    private readonly eventDispatcher: TaskDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: CreateTaskDto): Promise<Task> {
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) throw new ProjectNotFoundError(dto.projectId);
    await this.taskAccess.ensureCanCreateTask(actorUserId, project);
    project.updateDetails({}, actorUserId);
    project.pullDomainEvents();

    const section = dto.sectionId
      ? await this.sectionRepository.findById(dto.sectionId)
      : (await this.sectionRepository.listByProject(project.id))[0];
    if (!section) throw new ProjectSectionNotFoundError(dto.sectionId ?? 'first active section');
    if (section.projectId !== project.id) throw new TaskProjectMismatchError();

    if (dto.assigneeUserId) {
      await this.taskAccess.ensureEligibleAssignee(dto.assigneeUserId, project);
    }

    const position = await this.calculatePosition(
      project.id,
      section.id,
      dto.beforeTaskId,
      dto.afterTaskId,
    );
    const task = Task.create({
      workspaceId: project.workspaceId,
      projectId: project.id,
      sectionId: section.id,
      title: dto.title,
      description: dto.description,
      assigneeUserId: dto.assigneeUserId,
      reporterUserId: actorUserId,
      priority: dto.priority ? TaskPriority.from(dto.priority) : TaskPriority.NONE,
      dueDate: dto.dueDate,
      position,
    });

    await this.taskRepository.save(task);
    await this.eventDispatcher.dispatchAggregateEvents(task);
    return task;
  }

  private async calculatePosition(
    projectId: string,
    sectionId: string,
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
    if (before && (before.projectId !== projectId || before.sectionId !== sectionId)) {
      throw new TaskSectionMismatchError();
    }
    if (after && (after.projectId !== projectId || after.sectionId !== sectionId)) {
      throw new TaskSectionMismatchError();
    }

    if (this.positionService.needsRebalance(after, before)) {
      const tasks = await this.taskRepository.listBySection(projectId, sectionId);
      this.positionService.rebalance(tasks);
      await this.taskRepository.saveMany(tasks);
      return this.calculatePosition(projectId, sectionId, beforeTaskId, afterTaskId);
    }

    if (after || before) return this.positionService.between(after, before);
    return this.positionService.appendAfter(
      await this.taskRepository.findLastBySection(projectId, sectionId),
    );
  }
}
