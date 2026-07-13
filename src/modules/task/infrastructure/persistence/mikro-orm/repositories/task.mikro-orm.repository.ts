import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import {
  ITaskRepository,
  ListAssignedTasksFilters,
  ListProjectTasksFilters,
} from '../../../../domain/contracts/task.repository';
import { Task } from '../../../../domain/models/task.model';
import { TaskEntity } from '../entities/task.entity';
import { TaskMapper } from '../mappers/task.mapper';

@Injectable()
export class TaskMikroOrmRepository implements ITaskRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: TaskMapper,
  ) {}

  async findById(id: string): Promise<Task | null> {
    const entity = await this.em.findOne(TaskEntity, { id, deletedAt: null });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIdIncludingDeleted(id: string): Promise<Task | null> {
    const entity = await this.em.findOne(TaskEntity, { id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async listByProject(projectId: string, filters: ListProjectTasksFilters = {}): Promise<Task[]> {
    const where: FilterQuery<TaskEntity> = { projectId, deletedAt: null };
    if (filters.sectionId) where.sectionId = filters.sectionId;
    if (filters.assigneeUserId) where.assigneeUserId = filters.assigneeUserId;
    if (filters.lifecycleStatus) where.lifecycleStatus = filters.lifecycleStatus;
    if (filters.priority) where.priority = filters.priority;
    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) where.dueDate.$gte = filters.dueDateFrom;
      if (filters.dueDateTo) where.dueDate.$lte = filters.dueDateTo;
    }

    const entities = await this.em.find(TaskEntity, where, {
      orderBy: { sectionId: 'ASC', position: 'ASC', createdAt: 'ASC' },
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async listByAssignee(userId: string, filters: ListAssignedTasksFilters = {}): Promise<Task[]> {
    const where: FilterQuery<TaskEntity> = { assigneeUserId: userId, deletedAt: null };
    if (filters.workspaceId) where.workspaceId = filters.workspaceId;
    if (filters.lifecycleStatus) where.lifecycleStatus = filters.lifecycleStatus;
    const entities = await this.em.find(TaskEntity, where, {
      orderBy: { dueDate: 'ASC_NULLS_LAST', updatedAt: 'DESC' },
    });
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async listBySection(projectId: string, sectionId: string): Promise<Task[]> {
    const entities = await this.em.find(
      TaskEntity,
      { projectId, sectionId, deletedAt: null },
      { orderBy: { position: 'ASC', createdAt: 'ASC' } },
    );
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async findLastBySection(projectId: string, sectionId: string): Promise<Task | null> {
    const entity = await this.em.findOne(
      TaskEntity,
      { projectId, sectionId, deletedAt: null },
      { orderBy: { position: 'DESC' } },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async countActiveBySection(sectionId: string): Promise<number> {
    return this.em.count(TaskEntity, { sectionId, deletedAt: null });
  }

  async save(task: Task): Promise<void> {
    const existing = await this.em.findOne(TaskEntity, { id: task.id });
    if (existing) {
      this.em.assign(existing, this.mapper.toPersistence(task));
    } else {
      this.em.persist(this.mapper.toPersistence(task));
    }
    await this.em.flush();
  }

  async saveMany(tasks: Task[]): Promise<void> {
    for (const task of tasks) {
      const existing = await this.em.findOne(TaskEntity, { id: task.id });
      if (existing) {
        this.em.assign(existing, this.mapper.toPersistence(task));
      } else {
        this.em.persist(this.mapper.toPersistence(task));
      }
    }
    await this.em.flush();
  }
}
