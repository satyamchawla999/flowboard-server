import { Entity, Enum, Index, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';
import { ActivityMetadata } from '../../../../domain/models/activity.model';
import { ActivitySubjectType } from '../../../../domain/value-objects/activity-subject-type.vo';
import { ActivityType } from '../../../../domain/value-objects/activity-type.vo';

@Entity({ tableName: 'activities' })
@Unique({ properties: ['eventId'] })
@Index({ properties: ['workspaceId', 'occurredAt'] })
@Index({ properties: ['projectId', 'occurredAt'] })
@Index({ properties: ['taskId', 'occurredAt'] })
@Index({ properties: ['actorUserId'] })
@Index({ properties: ['type'] })
@Index({ properties: ['subjectType', 'subjectId'] })
@Index({ properties: ['occurredAt'] })
export class ActivityEntity extends BaseEntity {
  @Property({ nullable: true })
  eventId: string | null = null;

  @Property({ type: 'uuid' })
  workspaceId!: string;

  @Property({ type: 'uuid', nullable: true })
  projectId: string | null = null;

  @Property({ type: 'uuid', nullable: true })
  taskId: string | null = null;

  @Property({ type: 'uuid', nullable: true })
  sectionId: string | null = null;

  @Property({ type: 'uuid', nullable: true })
  actorUserId: string | null = null;

  @Enum({ items: () => ActivityType })
  type!: ActivityType;

  @Enum({ items: () => ActivitySubjectType })
  subjectType!: ActivitySubjectType;

  @Property({ type: 'uuid' })
  subjectId!: string;

  @Property({ type: 'jsonb' })
  metadata: ActivityMetadata = {};

  @Property()
  occurredAt!: Date;
}
