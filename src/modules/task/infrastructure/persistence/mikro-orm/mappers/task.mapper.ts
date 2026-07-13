import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { Task } from '../../../../domain/models/task.model';
import { TaskPriority } from '../../../../domain/value-objects/task-priority.vo';
import { TaskStatus } from '../../../../domain/value-objects/task-status.vo';
import { TaskEntity } from '../entities/task.entity';

/**
 * Translates between the Task domain model and the TaskEntity.
 *
 * Why a dedicated mapper class: keeping this translation explicit prevents
 * domain logic from leaking into the entity, and prevents ORM concerns from
 * leaking into the domain. Each layer speaks its own language; the mapper
 * is the interpreter at the boundary.
 */
@Injectable()
export class TaskMapper implements IMapper<Task, TaskEntity> {
  toDomain(entity: TaskEntity): Task {
    return Task.reconstitute({
      id: entity.id,
      title: entity.title,
      description: entity.description,
      projectId: entity.projectId,
      assigneeId: entity.assigneeId,
      createdById: entity.createdById,
      status: TaskStatus.from(entity.status),
      priority: TaskPriority.from(entity.priority),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Task): TaskEntity {
    const entity = new TaskEntity();
    entity.id = domain.id;
    entity.title = domain.title;
    entity.description = domain.description;
    entity.projectId = domain.projectId;
    entity.assigneeId = domain.assigneeId;
    entity.createdById = domain.createdById;
    entity.status = domain.status.value;
    entity.priority = domain.priority.value;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
