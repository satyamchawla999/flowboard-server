import { BaseDomainModel } from '@common/base';
import { TaskPriority } from '../value-objects/task-priority.vo';
import { TaskStatus } from '../value-objects/task-status.vo';
import { TaskCreatedEvent } from '../events/task-created.event';
import { TaskStatusChangedEvent } from '../events/task-status-changed.event';

interface CreateTaskProps {
  title: string;
  projectId: string;
  createdById: string;
  description?: string;
  priority?: TaskPriority;
}

interface ReconstitueTaskProps {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  assigneeId: string | null;
  createdById: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task is an aggregate root. All state changes go through its methods —
 * never mutate properties directly from outside.
 *
 * Domain events are collected here and dispatched by the application service
 * after the transaction commits. This prevents events from firing if a
 * database write rolls back.
 */
export class Task extends BaseDomainModel {
  title: string;
  description: string | null;
  projectId: string;
  assigneeId: string | null;
  createdById: string;
  status: TaskStatus;
  priority: TaskPriority;

  private readonly _domainEvents: Array<object> = [];

  private constructor(props: ReconstitueTaskProps) {
    super(props.id);
    this.title = props.title;
    this.description = props.description;
    this.projectId = props.projectId;
    this.assigneeId = props.assigneeId;
    this.createdById = props.createdById;
    this.status = props.status;
    this.priority = props.priority;
    // Preserve timestamps when reconstituting from persistence
    (this as { createdAt: Date }).createdAt = props.createdAt;
    (this as { updatedAt: Date }).updatedAt = props.updatedAt;
  }

  static create(props: CreateTaskProps): Task {
    const task = new Task({
      id: undefined as unknown as string,
      title: props.title,
      description: props.description ?? null,
      projectId: props.projectId,
      assigneeId: null,
      createdById: props.createdById,
      status: TaskStatus.TODO,
      priority: props.priority ?? TaskPriority.MEDIUM,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    task._domainEvents.push(
      new TaskCreatedEvent(task.id, task.title, task.projectId, task.createdById),
    );

    return task;
  }

  static reconstitute(props: ReconstitueTaskProps): Task {
    return new Task(props);
  }

  updateTitle(title: string): void {
    this.title = title;
    this.touch();
  }

  updateDescription(description: string | null): void {
    this.description = description;
    this.touch();
  }

  changeStatus(newStatus: TaskStatus, changedById: string): void {
    const previous = this.status;
    this.status = this.status.transitionTo(newStatus);
    this.touch();

    this._domainEvents.push(
      new TaskStatusChangedEvent(this.id, previous.value, newStatus.value, changedById),
    );
  }

  assign(assigneeId: string): void {
    this.assigneeId = assigneeId;
    this.touch();
  }

  changePriority(priority: TaskPriority): void {
    this.priority = priority;
    this.touch();
  }

  pullDomainEvents(): object[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }
}
