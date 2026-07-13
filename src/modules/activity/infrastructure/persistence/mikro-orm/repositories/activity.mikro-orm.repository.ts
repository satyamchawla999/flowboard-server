import { Injectable } from '@nestjs/common';
import { EntityManager, type FilterQuery } from '@mikro-orm/core';
import {
  ActivityPage,
  IActivityRepository,
  ListActivityOptions,
} from '../../../../domain/contracts/activity.repository';
import { Activity } from '../../../../domain/models/activity.model';
import { ActivityEntity } from '../entities/activity.entity';
import { ActivityMapper } from '../mappers/activity.mapper';

@Injectable()
export class ActivityMikroOrmRepository implements IActivityRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: ActivityMapper,
  ) {}

  async append(activity: Activity): Promise<void> {
    if (activity.eventId && (await this.findByEventId(activity.eventId))) return;
    this.em.persist(this.mapper.toPersistence(activity));
    await this.em.flush();
  }

  async findByEventId(eventId: string): Promise<Activity | null> {
    const entity = await this.em.findOne(ActivityEntity, { eventId });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async listByWorkspace(
    workspaceId: string,
    options: ListActivityOptions,
  ): Promise<ActivityPage<Activity>> {
    return this.list({ workspaceId }, options);
  }

  async listByProject(
    projectId: string,
    options: ListActivityOptions,
  ): Promise<ActivityPage<Activity>> {
    return this.list({ projectId }, options);
  }

  async listByTask(taskId: string, options: ListActivityOptions): Promise<ActivityPage<Activity>> {
    return this.list({ taskId }, options);
  }

  private async list(
    scope: Record<string, unknown>,
    options: ListActivityOptions,
  ): Promise<ActivityPage<Activity>> {
    const where: Record<string, unknown> = { ...scope };
    if (options.types?.length) where.type = { $in: options.types };
    if (options.actorUserId) where.actorUserId = options.actorUserId;
    if (options.after) {
      where.$or = [
        { occurredAt: { $lt: options.after.occurredAt } },
        { occurredAt: options.after.occurredAt, id: { $lt: options.after.id } },
      ];
    }

    const limit = options.first + 1;
    const entities = await this.em.find(ActivityEntity, where as FilterQuery<ActivityEntity>, {
      orderBy: { occurredAt: 'DESC', id: 'DESC' },
      limit,
    });
    return {
      items: entities.slice(0, options.first).map((entity) => this.mapper.toDomain(entity)),
      hasNextPage: entities.length > options.first,
    };
  }
}
