import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { EntityNotFoundError } from '@common/errors';
import { ITaskRepository, TASK_REPOSITORY } from '../../domain/contracts/task.repository';
import { Task } from '../../domain/models/task.model';
import { TaskPriority } from '../../domain/value-objects/task-priority.vo';
import { TaskStatus } from '../../domain/value-objects/task-status.vo';
import type { CreateTaskDto } from '../dto/create-task.dto';
import type { ChangeTaskStatusDto } from '../dto/change-task-status.dto';

/**
 * Application service — orchestrates use cases.
 *
 * Responsibilities:
 *   1. Load aggregates from the repository
 *   2. Call domain methods (business logic lives there, not here)
 *   3. Persist changes
 *   4. Dispatch domain events (after successful persist)
 *
 * Why dispatch events after save: if the save fails, the event should not fire.
 * Pulling events from the aggregate and emitting them here ensures atomicity
 * with the transaction (or at minimum, with the successful flush).
 */
@Injectable()
export class TaskService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createTask(dto: CreateTaskDto): Promise<Task> {
    const task = Task.create({
      title: dto.title,
      projectId: dto.projectId,
      createdById: dto.createdById,
      description: dto.description,
      priority: dto.priority ? TaskPriority.from(dto.priority) : undefined,
    });

    await this.taskRepository.save(task);
    this.dispatchEvents(task);

    return task;
  }

  async getTask(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) throw new EntityNotFoundError('Task', id);
    return task;
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return this.taskRepository.findByProjectId(projectId);
  }

  async changeTaskStatus(dto: ChangeTaskStatusDto): Promise<Task> {
    const task = await this.taskRepository.findById(dto.taskId);
    if (!task) throw new EntityNotFoundError('Task', dto.taskId);

    task.changeStatus(TaskStatus.from(dto.newStatus), dto.changedById);

    await this.taskRepository.save(task);
    this.dispatchEvents(task);

    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) throw new EntityNotFoundError('Task', id);
    await this.taskRepository.delete(id);
  }

  private dispatchEvents(aggregate: Task): void {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      const eventName = (event.constructor as { EVENT_NAME?: string }).EVENT_NAME;
      if (eventName) {
        this.eventEmitter.emit(eventName, event);
      }
    }
  }
}
