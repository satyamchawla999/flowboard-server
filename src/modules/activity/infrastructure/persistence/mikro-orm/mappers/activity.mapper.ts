import { Injectable } from '@nestjs/common';
import type { IMapper } from '@common/base';
import { Activity } from '../../../../domain/models/activity.model';
import { ActivityEntity } from '../entities/activity.entity';

@Injectable()
export class ActivityMapper implements IMapper<Activity, ActivityEntity> {
  toDomain(entity: ActivityEntity): Activity {
    return Activity.reconstitute({
      id: entity.id,
      eventId: entity.eventId,
      workspaceId: entity.workspaceId,
      projectId: entity.projectId,
      taskId: entity.taskId,
      sectionId: entity.sectionId,
      actorUserId: entity.actorUserId,
      type: entity.type,
      subjectType: entity.subjectType,
      subjectId: entity.subjectId,
      metadata: entity.metadata,
      occurredAt: entity.occurredAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Activity): ActivityEntity {
    const entity = new ActivityEntity();
    entity.id = domain.id;
    entity.eventId = domain.eventId;
    entity.workspaceId = domain.workspaceId;
    entity.projectId = domain.projectId;
    entity.taskId = domain.taskId;
    entity.sectionId = domain.sectionId;
    entity.actorUserId = domain.actorUserId;
    entity.type = domain.type;
    entity.subjectType = domain.subjectType;
    entity.subjectId = domain.subjectId;
    entity.metadata = domain.metadata;
    entity.occurredAt = domain.occurredAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
