import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InboxMessageStatus } from '../domain/inbox-message-status';
import { InboxMessageEntity } from './inbox-message.entity';

export interface StartInboxProcessingInput {
  messageId: string;
  handlerName: string;
  eventName: string;
  workspaceId: string | null;
  payload: Record<string, unknown>;
  headers: Record<string, unknown>;
  workerId: string;
  now: Date;
  lockTtlMs: number;
}

export interface StartInboxProcessingResult {
  acquired: boolean;
  alreadyProcessed: boolean;
  inboxMessage: InboxMessageEntity | null;
}

export interface MarkInboxFailedInput {
  id: string;
  workerId: string;
  attemptCount: number;
  error: string;
  nextAttemptAt: Date | null;
  now: Date;
}

@Injectable()
export class InboxMessageRepository {
  constructor(private readonly em: EntityManager) {}

  async startProcessing(input: StartInboxProcessingInput): Promise<StartInboxProcessingResult> {
    return this.em.transactional(async (em) => {
      const existing = await em.findOne(InboxMessageEntity, {
        messageId: input.messageId,
        handlerName: input.handlerName,
      });

      if (!existing) {
        const message = new InboxMessageEntity();
        message.messageId = input.messageId;
        message.handlerName = input.handlerName;
        message.eventName = input.eventName;
        message.workspaceId = input.workspaceId;
        message.payload = input.payload;
        message.headers = input.headers;
        message.status = InboxMessageStatus.PROCESSING;
        message.lockedAt = input.now;
        message.lockedBy = input.workerId;
        await em.persistAndFlush(message);
        return { acquired: true, alreadyProcessed: false, inboxMessage: message };
      }

      if (existing.status === InboxMessageStatus.PROCESSED) {
        return { acquired: false, alreadyProcessed: true, inboxMessage: existing };
      }

      const staleBefore = new Date(input.now.getTime() - input.lockTtlMs);
      if (
        existing.lockedAt &&
        existing.lockedAt > staleBefore &&
        existing.lockedBy !== input.workerId
      ) {
        return { acquired: false, alreadyProcessed: false, inboxMessage: existing };
      }

      existing.status = InboxMessageStatus.PROCESSING;
      existing.eventName = input.eventName;
      existing.workspaceId = input.workspaceId;
      existing.payload = input.payload;
      existing.headers = input.headers;
      existing.lockedAt = input.now;
      existing.lockedBy = input.workerId;
      existing.nextAttemptAt = null;
      await em.flush();

      return { acquired: true, alreadyProcessed: false, inboxMessage: existing };
    });
  }

  async markProcessed(id: string, workerId: string, now: Date): Promise<void> {
    await this.em.nativeUpdate(
      InboxMessageEntity,
      { id, lockedBy: workerId },
      {
        status: InboxMessageStatus.PROCESSED,
        processedAt: now,
        lockedAt: null,
        lockedBy: null,
        lastError: null,
        updatedAt: now,
      },
    );
  }

  async markFailed(input: MarkInboxFailedInput): Promise<void> {
    await this.em.nativeUpdate(
      InboxMessageEntity,
      { id: input.id, lockedBy: input.workerId },
      {
        status: InboxMessageStatus.FAILED,
        attemptCount: input.attemptCount,
        nextAttemptAt: input.nextAttemptAt,
        lockedAt: null,
        lockedBy: null,
        lastError: input.error,
        updatedAt: input.now,
      },
    );
  }
}
