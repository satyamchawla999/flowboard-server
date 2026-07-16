import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { DomainEventEnvelope } from '../domain/domain-event-envelope';
import { OutboxMessageStatus } from '../domain/outbox-message-status';
import { OutboxMessageEntity } from './outbox-message.entity';

export interface ClaimOutboxMessagesOptions {
  batchSize: number;
  workerId: string;
  now: Date;
  lockTtlMs: number;
}

export interface MarkOutboxMessageFailedOptions {
  id: string;
  workerId: string;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: Date;
  error: string;
  now: Date;
}

@Injectable()
export class OutboxMessageRepository {
  constructor(private readonly em: EntityManager) {}

  async append(envelope: DomainEventEnvelope): Promise<void> {
    this.em.persist(this.toEntity(envelope));
    await this.em.flush();
  }

  async appendMany(envelopes: DomainEventEnvelope[]): Promise<void> {
    for (const envelope of envelopes) {
      this.em.persist(this.toEntity(envelope));
    }

    await this.em.flush();
  }

  async claimPendingBatch(options: ClaimOutboxMessagesOptions): Promise<OutboxMessageEntity[]> {
    const staleBefore = new Date(options.now.getTime() - options.lockTtlMs);

    return this.em.transactional(async (em) => {
      const rows = (await em.getConnection().execute(
        `
          select "id"
          from "outbox_messages"
          where "status" = ?
            and ("next_attempt_at" is null or "next_attempt_at" <= ?)
            and ("locked_at" is null or "locked_at" <= ?)
          order by "occurred_at" asc, "id" asc
          limit ?
          for update skip locked
        `,
        [OutboxMessageStatus.PENDING, options.now, staleBefore, options.batchSize],
      )) as Array<{ id: string }>;

      const ids = rows.map((row) => row.id);
      if (!ids.length) return [];

      await em.nativeUpdate(
        OutboxMessageEntity,
        { id: { $in: ids } },
        {
          lockedAt: options.now,
          lockedBy: options.workerId,
          updatedAt: options.now,
        },
      );

      return em.find(
        OutboxMessageEntity,
        { id: { $in: ids }, lockedBy: options.workerId },
        { orderBy: { occurredAt: 'ASC', id: 'ASC' } },
      );
    });
  }

  async markPublished(id: string, workerId: string, now: Date): Promise<void> {
    await this.em.nativeUpdate(
      OutboxMessageEntity,
      { id, lockedBy: workerId },
      {
        status: OutboxMessageStatus.PUBLISHED,
        publishedAt: now,
        lockedAt: null,
        lockedBy: null,
        lastError: null,
        updatedAt: now,
      },
    );
  }

  async markFailed(options: MarkOutboxMessageFailedOptions): Promise<void> {
    const isTerminal = options.attemptCount >= options.maxAttempts;

    await this.em.nativeUpdate(
      OutboxMessageEntity,
      { id: options.id, lockedBy: options.workerId },
      {
        status: isTerminal ? OutboxMessageStatus.FAILED : OutboxMessageStatus.PENDING,
        attemptCount: options.attemptCount,
        nextAttemptAt: isTerminal ? null : options.nextAttemptAt,
        lockedAt: null,
        lockedBy: null,
        lastError: options.error,
        updatedAt: options.now,
      },
    );
  }

  private toEntity(envelope: DomainEventEnvelope): OutboxMessageEntity {
    const message = new OutboxMessageEntity();
    message.eventId = envelope.eventId;
    message.eventName = envelope.eventName;
    message.occurredAt = envelope.occurredAt;
    message.aggregateId = envelope.aggregateId;
    message.aggregateType = envelope.aggregateType;
    message.workspaceId = envelope.workspaceId;
    message.payload = envelope.payload;
    message.headers = envelope.headers;
    message.nextAttemptAt = envelope.occurredAt;
    return message;
  }
}
