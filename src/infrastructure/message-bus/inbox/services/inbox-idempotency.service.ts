import { Injectable } from '@nestjs/common';
import { InboxMessageEntity } from '../persistence/inbox-message.entity';
import { InboxMessageRepository } from '../persistence/inbox-message.repository';

export interface IncomingInboxMessage {
  messageId: string;
  handlerName: string;
  eventName: string;
  workspaceId: string | null;
  payload: Record<string, unknown>;
  headers: Record<string, unknown>;
}

export interface BeginInboxProcessingOptions {
  workerId: string;
  lockTtlMs: number;
}

export interface BeginInboxProcessingResult {
  shouldProcess: boolean;
  alreadyProcessed: boolean;
  inboxMessage: InboxMessageEntity | null;
}

@Injectable()
export class InboxIdempotencyService {
  constructor(private readonly inboxRepository: InboxMessageRepository) {}

  async beginProcessing(
    message: IncomingInboxMessage,
    options: BeginInboxProcessingOptions,
  ): Promise<BeginInboxProcessingResult> {
    const result = await this.inboxRepository.startProcessing({
      ...message,
      workerId: options.workerId,
      now: new Date(),
      lockTtlMs: options.lockTtlMs,
    });

    return {
      shouldProcess: result.acquired,
      alreadyProcessed: result.alreadyProcessed,
      inboxMessage: result.inboxMessage,
    };
  }

  async markProcessed(message: InboxMessageEntity, workerId: string): Promise<void> {
    await this.inboxRepository.markProcessed(message.id, workerId, new Date());
  }

  async markFailed(
    message: InboxMessageEntity,
    workerId: string,
    attemptCount: number,
    error: unknown,
    nextAttemptAt: Date | null,
  ): Promise<void> {
    await this.inboxRepository.markFailed({
      id: message.id,
      workerId,
      attemptCount,
      error: this.errorMessage(error),
      nextAttemptAt,
      now: new Date(),
    });
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) return error.stack ?? error.message;
    return String(error);
  }
}
