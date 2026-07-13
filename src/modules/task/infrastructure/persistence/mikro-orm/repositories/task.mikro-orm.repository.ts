import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import type { ITaskRepository } from '../../../../domain/contracts/task.repository';
import { Task } from '../../../../domain/models/task.model';
import { TaskEntity } from '../entities/task.entity';
import { TaskMapper } from '../mappers/task.mapper';

/**
 * Concrete repository implementation — lives entirely in infrastructure.
 *
 * Why EntityManager over MikroORM's built-in EntityRepository: EM gives us
 * explicit control over the unit of work. Application services manage when
 * to flush (commit the transaction), so repositories don't auto-flush.
 * This keeps transaction boundaries in the application layer where they belong.
 */
@Injectable()
export class TaskMikroOrmRepository implements ITaskRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: TaskMapper,
  ) {}

  async findById(id: string): Promise<Task | null> {
    const entity = await this.em.findOne(TaskEntity, { id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Task[]> {
    const entities = await this.em.findAll(TaskEntity);
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const entities = await this.em.find(TaskEntity, { projectId });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByAssigneeId(assigneeId: string): Promise<Task[]> {
    const entities = await this.em.find(TaskEntity, { assigneeId });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(task: Task): Promise<void> {
    const existing = await this.em.findOne(TaskEntity, { id: task.id });

    if (existing) {
      const updated = this.mapper.toPersistence(task);
      this.em.assign(existing, updated);
    } else {
      const entity = this.mapper.toPersistence(task);
      this.em.persist(entity);
    }

    await this.em.flush();
  }

  async delete(id: string): Promise<void> {
    const entity = await this.em.findOne(TaskEntity, { id });
    if (entity) {
      this.em.remove(entity);
      await this.em.flush();
    }
  }
}
