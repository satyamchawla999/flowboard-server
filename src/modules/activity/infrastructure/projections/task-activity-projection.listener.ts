import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  IProjectSectionRepository,
  PROJECT_SECTION_REPOSITORY,
} from '@modules/project/domain/contracts/project-section.repository';
import {
  IProjectUserProfileRepository,
  PROJECT_USER_PROFILE_REPOSITORY,
} from '@modules/project/domain/contracts/project-user-profile.repository';
import {
  ACTIVITY_TASK_READER,
  IActivityTaskReader,
} from '@modules/task/domain/contracts/activity-task-reader.service';
import { TaskAssignedEvent } from '@modules/task/domain/events/task-assigned.event';
import { TaskCompletedEvent } from '@modules/task/domain/events/task-completed.event';
import { TaskCreatedEvent } from '@modules/task/domain/events/task-created.event';
import { TaskDeletedEvent } from '@modules/task/domain/events/task-deleted.event';
import { TaskDueDateChangedEvent } from '@modules/task/domain/events/task-due-date-changed.event';
import { TaskMovedEvent } from '@modules/task/domain/events/task-moved.event';
import { TaskPriorityChangedEvent } from '@modules/task/domain/events/task-priority-changed.event';
import { TaskReopenedEvent } from '@modules/task/domain/events/task-reopened.event';
import { TaskReorderedEvent } from '@modules/task/domain/events/task-reordered.event';
import { TaskUnassignedEvent } from '@modules/task/domain/events/task-unassigned.event';
import { TaskUpdatedEvent } from '@modules/task/domain/events/task-updated.event';
import { ActivitySubjectType } from '../../domain/value-objects/activity-subject-type.vo';
import { ActivityType } from '../../domain/value-objects/activity-type.vo';
import { ActivityAppendService } from '../services/activity-append.service';

@Injectable()
export class TaskActivityProjectionListener {
  constructor(
    private readonly appendService: ActivityAppendService,
    @Inject(ACTIVITY_TASK_READER)
    private readonly activityTaskReader: IActivityTaskReader,
    @Inject(PROJECT_SECTION_REPOSITORY)
    private readonly sectionRepository: IProjectSectionRepository,
    @Inject(PROJECT_USER_PROFILE_REPOSITORY)
    private readonly profileRepository: IProjectUserProfileRepository,
  ) {}

  @OnEvent(TaskCreatedEvent.EVENT_NAME)
  async onCreated(event: TaskCreatedEvent): Promise<void> {
    const task = await this.activityTaskReader.findTaskSnapshotById(event.taskId);
    await this.appendTask(event, ActivityType.TASK_CREATED, event.reporterUserId, {
      taskTitle: task?.title,
      sectionId: event.sectionId,
      sectionName: await this.sectionName(event.sectionId),
      assigneeUserId: task?.assigneeUserId,
      assigneeDisplayName: task?.assigneeUserId
        ? await this.displayName(task.assigneeUserId)
        : null,
      priority: task?.priority.value,
      dueDate: task?.dueDate?.toISOString() ?? null,
    });
  }

  @OnEvent(TaskUpdatedEvent.EVENT_NAME)
  async onUpdated(event: TaskUpdatedEvent): Promise<void> {
    const task = await this.activityTaskReader.findTaskSnapshotById(event.taskId);
    await this.appendTask(event, ActivityType.TASK_UPDATED, event.actorUserId, {
      taskTitle: task?.title,
      changedFields: [],
    });
  }

  @OnEvent(TaskAssignedEvent.EVENT_NAME)
  async onAssigned(event: TaskAssignedEvent): Promise<void> {
    const task = await this.activityTaskReader.findTaskSnapshotById(event.taskId);
    await this.appendTask(event, ActivityType.TASK_ASSIGNED, event.actorUserId, {
      taskTitle: task?.title,
      assigneeUserId: event.assigneeUserId,
      assigneeDisplayName: await this.displayName(event.assigneeUserId),
    });
  }

  @OnEvent(TaskUnassignedEvent.EVENT_NAME)
  async onUnassigned(event: TaskUnassignedEvent): Promise<void> {
    const task = await this.activityTaskReader.findTaskSnapshotById(event.taskId);
    await this.appendTask(event, ActivityType.TASK_UNASSIGNED, event.actorUserId, {
      taskTitle: task?.title,
      previousAssigneeUserId: event.previousAssigneeUserId,
      previousAssigneeDisplayName: event.previousAssigneeUserId
        ? await this.displayName(event.previousAssigneeUserId)
        : null,
    });
  }

  @OnEvent(TaskPriorityChangedEvent.EVENT_NAME)
  async onPriorityChanged(event: TaskPriorityChangedEvent): Promise<void> {
    const task = await this.activityTaskReader.findTaskSnapshotById(event.taskId);
    await this.appendTask(event, ActivityType.TASK_PRIORITY_CHANGED, event.actorUserId, {
      taskTitle: task?.title,
      previousPriority: event.previousPriority,
      newPriority: event.newPriority,
    });
  }

  @OnEvent(TaskDueDateChangedEvent.EVENT_NAME)
  async onDueDateChanged(event: TaskDueDateChangedEvent): Promise<void> {
    const task = await this.activityTaskReader.findTaskSnapshotById(event.taskId);
    await this.appendTask(event, ActivityType.TASK_DUE_DATE_CHANGED, event.actorUserId, {
      taskTitle: task?.title,
      previousDueDate: event.previousDueDate?.toISOString() ?? null,
      newDueDate: event.newDueDate?.toISOString() ?? null,
    });
  }

  @OnEvent(TaskCompletedEvent.EVENT_NAME)
  async onCompleted(event: TaskCompletedEvent): Promise<void> {
    const task = await this.activityTaskReader.findTaskSnapshotById(event.taskId);
    await this.appendTask(event, ActivityType.TASK_COMPLETED, event.actorUserId, {
      taskTitle: task?.title,
      completedAt: event.completedAt.toISOString(),
    });
  }

  @OnEvent(TaskReopenedEvent.EVENT_NAME)
  async onReopened(event: TaskReopenedEvent): Promise<void> {
    const task = await this.activityTaskReader.findTaskSnapshotById(event.taskId);
    await this.appendTask(event, ActivityType.TASK_REOPENED, event.actorUserId, {
      taskTitle: task?.title,
    });
  }

  @OnEvent(TaskMovedEvent.EVENT_NAME)
  async onMoved(event: TaskMovedEvent): Promise<void> {
    const task = await this.activityTaskReader.findTaskSnapshotById(event.taskId);
    await this.appendTask(event, ActivityType.TASK_MOVED, event.actorUserId, {
      taskTitle: task?.title,
      fromSectionId: event.fromSectionId,
      fromSectionName: await this.sectionName(event.fromSectionId),
      toSectionId: event.toSectionId,
      toSectionName: await this.sectionName(event.toSectionId),
      previousPosition: event.previousPosition,
      newPosition: event.newPosition,
    });
  }

  @OnEvent(TaskReorderedEvent.EVENT_NAME)
  async onReordered(event: TaskReorderedEvent): Promise<void> {
    const task = await this.activityTaskReader.findTaskSnapshotById(event.taskId);
    await this.appendTask(event, ActivityType.TASK_REORDERED, event.actorUserId, {
      taskTitle: task?.title,
      sectionId: task?.sectionId,
      sectionName: task?.sectionId ? await this.sectionName(task.sectionId) : null,
      previousPosition: event.previousPosition,
      newPosition: event.newPosition,
    });
  }

  @OnEvent(TaskDeletedEvent.EVENT_NAME)
  async onDeleted(event: TaskDeletedEvent): Promise<void> {
    const task = await this.activityTaskReader.findTaskSnapshotById(event.taskId);
    await this.appendTask(event, ActivityType.TASK_DELETED, event.actorUserId, {
      taskTitle: task?.title,
      sectionId: task?.sectionId,
    });
  }

  private async appendTask(
    event: {
      taskId: string;
      workspaceId: string;
      projectId: string;
      eventId?: string;
      eventName?: string;
      occurredAt?: Date | string;
    },
    type: ActivityType,
    actorUserId: string | null,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    const task = await this.activityTaskReader.findTaskSnapshotById(event.taskId);
    await this.appendService.append({
      eventName: this.eventName(event, type),
      workspaceId: event.workspaceId,
      projectId: event.projectId,
      taskId: event.taskId,
      sectionId: task?.sectionId ?? null,
      actorUserId,
      type,
      subjectType: ActivitySubjectType.TASK,
      subjectId: event.taskId,
      metadata,
      eventId: event.eventId,
      occurredAt: this.occurredAt(event),
    });
  }

  private async sectionName(sectionId: string): Promise<string | null> {
    return (await this.sectionRepository.findByIdIncludingDeleted(sectionId))?.name ?? null;
  }

  private async displayName(userId: string): Promise<string | null> {
    return (await this.profileRepository.findByUserId(userId))?.displayName ?? null;
  }

  private eventName(event: object, fallback: ActivityType): string {
    return (
      (event as { eventName?: string }).eventName ??
      (event.constructor as unknown as { EVENT_NAME?: string }).EVENT_NAME ??
      fallback
    );
  }

  private occurredAt(event: { occurredAt?: Date | string }): Date | undefined {
    if (event.occurredAt instanceof Date) return event.occurredAt;
    if (typeof event.occurredAt === 'string') {
      const date = new Date(event.occurredAt);
      if (!Number.isNaN(date.getTime())) return date;
    }
    return undefined;
  }
}
