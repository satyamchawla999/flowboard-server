import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { Task } from '../../../../domain/models/task.model';
import { TaskLifecycleStatus } from '../../../../domain/value-objects/task-lifecycle-status.vo';
import { TaskPriority } from '../../../../domain/value-objects/task-priority.vo';
import { TaskEntity } from '../entities/task.entity';

@Injectable()
export class TaskMapper implements IMapper<Task, TaskEntity> {
  toDomain(entity: TaskEntity): Task {
    return Task.reconstitute({
      id: entity.id,
      workspaceId: entity.workspaceId,
      projectId: entity.projectId,
      sectionId: entity.sectionId,
      parentTaskId: entity.parentTaskId,
      title: entity.title,
      description: entity.description,
      assigneeUserId: entity.assigneeUserId,
      reporterUserId: entity.reporterUserId,
      priority: TaskPriority.from(entity.priority),
      lifecycleStatus: TaskLifecycleStatus.from(entity.lifecycleStatus),
      dueDate: entity.dueDate,
      position: Number(entity.position),
      completedAt: entity.completedAt,
      deletedAt: entity.deletedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Task): TaskEntity {
    const entity = new TaskEntity();
    entity.id = domain.id;
    entity.workspaceId = domain.workspaceId;
    entity.projectId = domain.projectId;
    entity.sectionId = domain.sectionId;
    entity.parentTaskId = domain.parentTaskId;
    entity.title = domain.title;
    entity.description = domain.description;
    entity.assigneeUserId = domain.assigneeUserId;
    entity.reporterUserId = domain.reporterUserId;
    entity.priority = domain.priority.value;
    entity.lifecycleStatus = domain.lifecycleStatus.value;
    entity.dueDate = domain.dueDate;
    entity.position = domain.position.toFixed(6);
    entity.completedAt = domain.completedAt;
    entity.deletedAt = domain.deletedAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
