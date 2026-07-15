import { Entity, Enum, Index, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';
import { OutboxMessageStatus } from '../domain/outbox-message-status';

@Entity({ tableName: 'outbox_messages' })
@Unique({ properties: ['eventId'] })
@Index({ properties: ['status', 'nextAttemptAt'] })
@Index({ properties: ['lockedAt'] })
@Index({ properties: ['workspaceId'] })
@Index({ properties: ['aggregateType', 'aggregateId'] })
@Index({ properties: ['eventName'] })
@Index({ properties: ['occurredAt'] })
export class OutboxMessageEntity extends BaseEntity {
  @Property({ type: 'uuid' })
  eventId!: string;

  @Property()
  eventName!: string;

  @Property()
  occurredAt!: Date;

  @Property({ type: 'uuid' })
  aggregateId!: string;

  @Property()
  aggregateType!: string;

  @Property({ type: 'uuid', nullable: true })
  workspaceId: string | null = null;

  @Property({ type: 'jsonb' })
  payload: Record<string, unknown> = {};

  @Property({ type: 'jsonb' })
  headers: Record<string, unknown> = {};

  @Enum({ items: () => OutboxMessageStatus })
  status: OutboxMessageStatus = OutboxMessageStatus.PENDING;

  @Property()
  attemptCount = 0;

  @Property({ nullable: true })
  nextAttemptAt: Date | null = null;

  @Property({ nullable: true })
  lockedAt: Date | null = null;

  @Property({ nullable: true })
  lockedBy: string | null = null;

  @Property({ type: 'text', nullable: true })
  lastError: string | null = null;

  @Property({ nullable: true })
  publishedAt: Date | null = null;
}
