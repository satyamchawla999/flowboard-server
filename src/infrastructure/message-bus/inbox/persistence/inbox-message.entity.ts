import { Entity, Enum, Index, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';
import { InboxMessageStatus } from '../domain/inbox-message-status';

@Entity({ tableName: 'inbox_messages' })
@Unique({ properties: ['messageId', 'handlerName'] })
@Index({ properties: ['status', 'nextAttemptAt'] })
@Index({ properties: ['lockedAt'] })
@Index({ properties: ['messageId'] })
@Index({ properties: ['handlerName'] })
@Index({ properties: ['eventName'] })
export class InboxMessageEntity extends BaseEntity {
  @Property()
  messageId!: string;

  @Property()
  handlerName!: string;

  @Property()
  eventName!: string;

  @Property({ type: 'uuid', nullable: true })
  workspaceId: string | null = null;

  @Property({ type: 'jsonb' })
  payload: Record<string, unknown> = {};

  @Property({ type: 'jsonb' })
  headers: Record<string, unknown> = {};

  @Enum({ items: () => InboxMessageStatus })
  status: InboxMessageStatus = InboxMessageStatus.PROCESSING;

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
  processedAt: Date | null = null;
}
