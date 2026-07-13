import { BaseDomainModel } from '@common/base';
import { TaskAssignedEvent } from '../events/task-assigned.event';
import { TaskCompletedEvent } from '../events/task-completed.event';
import { TaskCreatedEvent } from '../events/task-created.event';
import { TaskDeletedEvent } from '../events/task-deleted.event';
import { TaskDueDateChangedEvent } from '../events/task-due-date-changed.event';
import { TaskMovedEvent } from '../events/task-moved.event';
import { TaskPriorityChangedEvent } from '../events/task-priority-changed.event';
import { TaskReopenedEvent } from '../events/task-reopened.event';
import { TaskReorderedEvent } from '../events/task-reordered.event';
import { TaskUnassignedEvent } from '../events/task-unassigned.event';
import { TaskUpdatedEvent } from '../events/task-updated.event';
import {
  TaskDeletedError,
  TaskPositionInvalidError,
  TaskTitleInvalidError,
} from '../errors/task.errors';
import { TaskLifecycleStatus } from '../value-objects/task-lifecycle-status.vo';
import { TaskPriority } from '../value-objects/task-priority.vo';

interface CreateTaskProps {
  workspaceId: string;
  projectId: string;
  sectionId: string;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  assigneeUserId?: string | null;
  reporterUserId: string;
  priority?: TaskPriority;
  dueDate?: Date | null;
  position: number;
}

interface ReconstituteTaskProps extends CreateTaskProps {
  id: string;
  lifecycleStatus: TaskLifecycleStatus;
  completedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Task extends BaseDomainModel {
  workspaceId: string;
  projectId: string;
  sectionId: string;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  assigneeUserId: string | null;
  reporterUserId: string;
  priority: TaskPriority;
  lifecycleStatus: TaskLifecycleStatus;
  dueDate: Date | null;
  position: number;
  completedAt: Date | null;
  deletedAt: Date | null;

  private readonly _domainEvents: Array<object> = [];

  private constructor(props: ReconstituteTaskProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.projectId = props.projectId;
    this.sectionId = props.sectionId;
    this.parentTaskId = props.parentTaskId ?? null;
    this.title = Task.normalizeTitle(props.title);
    this.description = props.description ?? null;
    this.assigneeUserId = props.assigneeUserId ?? null;
    this.reporterUserId = props.reporterUserId;
    this.priority = props.priority ?? TaskPriority.NONE;
    this.lifecycleStatus = props.lifecycleStatus;
    this.dueDate = props.dueDate ?? null;
    this.position = Task.normalizePosition(props.position);
    this.completedAt = props.completedAt;
    this.deletedAt = props.deletedAt;
    (this as { createdAt: Date }).createdAt = props.createdAt;
    (this as { updatedAt: Date }).updatedAt = props.updatedAt;
  }

  static create(props: CreateTaskProps): Task {
    const task = new Task({
      ...props,
      id: undefined as unknown as string,
      lifecycleStatus: TaskLifecycleStatus.OPEN,
      completedAt: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    task._domainEvents.push(
      new TaskCreatedEvent(
        task.id,
        task.workspaceId,
        task.projectId,
        task.sectionId,
        task.reporterUserId,
      ),
    );

    return task;
  }

  static reconstitute(props: ReconstituteTaskProps): Task {
    return new Task(props);
  }

  updateDetails(props: { title?: string; description?: string | null }, actorUserId: string): void {
    this.ensureNotDeleted();
    let changed = false;

    if (props.title !== undefined) {
      const title = Task.normalizeTitle(props.title);
      if (this.title !== title) {
        this.title = title;
        changed = true;
      }
    }

    if (props.description !== undefined && this.description !== props.description) {
      this.description = props.description;
      changed = true;
    }

    if (!changed) return;
    this.touch();
    this._domainEvents.push(
      new TaskUpdatedEvent(this.id, this.workspaceId, this.projectId, actorUserId),
    );
  }

  assign(assigneeUserId: string, actorUserId: string): void {
    this.ensureNotDeleted();
    if (this.assigneeUserId === assigneeUserId) return;
    this.assigneeUserId = assigneeUserId;
    this.touch();
    this._domainEvents.push(
      new TaskAssignedEvent(this.id, this.workspaceId, this.projectId, actorUserId, assigneeUserId),
    );
  }

  unassign(actorUserId: string): void {
    this.ensureNotDeleted();
    if (!this.assigneeUserId) return;
    const previousAssigneeUserId = this.assigneeUserId;
    this.assigneeUserId = null;
    this.touch();
    this._domainEvents.push(
      new TaskUnassignedEvent(
        this.id,
        this.workspaceId,
        this.projectId,
        actorUserId,
        previousAssigneeUserId,
      ),
    );
  }

  changePriority(priority: TaskPriority, actorUserId: string): void {
    this.ensureNotDeleted();
    if (this.priority.value === priority.value) return;
    const previousPriority = this.priority.value;
    this.priority = priority;
    this.touch();
    this._domainEvents.push(
      new TaskPriorityChangedEvent(
        this.id,
        this.workspaceId,
        this.projectId,
        actorUserId,
        previousPriority,
        priority.value,
      ),
    );
  }

  setDueDate(dueDate: Date | null, actorUserId: string): void {
    this.ensureNotDeleted();
    if ((this.dueDate?.getTime() ?? null) === (dueDate?.getTime() ?? null)) return;
    const previousDueDate = this.dueDate;
    this.dueDate = dueDate;
    this.touch();
    this._domainEvents.push(
      new TaskDueDateChangedEvent(
        this.id,
        this.workspaceId,
        this.projectId,
        actorUserId,
        previousDueDate,
        dueDate,
      ),
    );
  }

  complete(actorUserId: string, completedAt = new Date()): void {
    this.ensureNotDeleted();
    if (this.lifecycleStatus.value === TaskLifecycleStatus.COMPLETED.value) return;
    this.lifecycleStatus = TaskLifecycleStatus.COMPLETED;
    this.completedAt = completedAt;
    this.touch();
    this._domainEvents.push(
      new TaskCompletedEvent(this.id, this.workspaceId, this.projectId, actorUserId, completedAt),
    );
  }

  reopen(actorUserId: string): void {
    this.ensureNotDeleted();
    if (this.lifecycleStatus.value === TaskLifecycleStatus.OPEN.value) return;
    this.lifecycleStatus = TaskLifecycleStatus.OPEN;
    this.completedAt = null;
    this.touch();
    this._domainEvents.push(
      new TaskReopenedEvent(this.id, this.workspaceId, this.projectId, actorUserId),
    );
  }

  moveToSection(sectionId: string, position: number, actorUserId: string): void {
    this.ensureNotDeleted();
    const normalizedPosition = Task.normalizePosition(position);
    if (this.sectionId === sectionId && this.position === normalizedPosition) return;
    const previousSectionId = this.sectionId;
    const previousPosition = this.position;
    this.sectionId = sectionId;
    this.position = normalizedPosition;
    this.touch();
    this._domainEvents.push(
      new TaskMovedEvent(
        this.id,
        this.workspaceId,
        this.projectId,
        actorUserId,
        previousSectionId,
        sectionId,
        previousPosition,
        normalizedPosition,
      ),
    );
  }

  reorder(position: number, actorUserId: string): void {
    this.ensureNotDeleted();
    const normalizedPosition = Task.normalizePosition(position);
    if (this.position === normalizedPosition) return;
    const previousPosition = this.position;
    this.position = normalizedPosition;
    this.touch();
    this._domainEvents.push(
      new TaskReorderedEvent(
        this.id,
        this.workspaceId,
        this.projectId,
        actorUserId,
        previousPosition,
        normalizedPosition,
      ),
    );
  }

  softDelete(actorUserId: string): void {
    this.ensureNotDeleted();
    this.deletedAt = new Date();
    this.touch();
    this._domainEvents.push(
      new TaskDeletedEvent(this.id, this.workspaceId, this.projectId, actorUserId),
    );
  }

  get isDeleted(): boolean {
    return Boolean(this.deletedAt);
  }

  pullDomainEvents(): object[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }

  static normalizeTitle(title: string): string {
    const normalized = title.trim();
    if (!normalized || normalized.length > 200) throw new TaskTitleInvalidError();
    return normalized;
  }

  private ensureNotDeleted(): void {
    if (this.deletedAt) throw new TaskDeletedError(this.id);
  }

  private static normalizePosition(position: number): number {
    if (!Number.isFinite(position) || position <= 0) throw new TaskPositionInvalidError();
    return Number(position);
  }
}
