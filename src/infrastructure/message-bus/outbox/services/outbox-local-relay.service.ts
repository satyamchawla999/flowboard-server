import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RabbitMqOutboxPublisherService } from '../../rabbitmq/rabbitmq-outbox-publisher.service';
import { OutboxMessageEntity } from '../persistence/outbox-message.entity';
import { OutboxMessageRepository } from '../persistence/outbox-message.repository';

export interface RelayOutboxBatchOptions {
  batchSize: number;
  workerId: string;
  maxAttempts: number;
  lockTtlMs: number;
  baseRetryDelayMs: number;
  maxRetryDelayMs: number;
}

export interface RelayOutboxBatchResult {
  claimed: number;
  published: number;
  failed: number;
}

@Injectable()
export class OutboxLocalRelayService {
  private readonly logger = new Logger(OutboxLocalRelayService.name);

  constructor(
    private readonly outboxRepository: OutboxMessageRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly rabbitMqPublisher: RabbitMqOutboxPublisherService,
  ) {}

  async relayBatch(options: RelayOutboxBatchOptions): Promise<RelayOutboxBatchResult> {
    const messages = await this.outboxRepository.claimPendingBatch({
      batchSize: options.batchSize,
      workerId: options.workerId,
      now: new Date(),
      lockTtlMs: options.lockTtlMs,
    });

    const result: RelayOutboxBatchResult = {
      claimed: messages.length,
      published: 0,
      failed: 0,
    };

    for (const message of messages) {
      try {
        const payload = this.toLocalEventPayload(message);
        await this.eventEmitter.emitAsync(message.eventName, payload);
        await this.rabbitMqPublisher.publish(message, payload);
        await this.outboxRepository.markPublished(message.id, options.workerId, new Date());
        result.published += 1;
      } catch (error) {
        result.failed += 1;
        await this.markMessageFailed(message, options, error);
      }
    }

    return result;
  }

  private async markMessageFailed(
    message: OutboxMessageEntity,
    options: RelayOutboxBatchOptions,
    error: unknown,
  ): Promise<void> {
    const attemptCount = message.attemptCount + 1;
    const retryDelayMs = this.retryDelayMs(attemptCount, options);
    const now = new Date();
    const errorMessage = this.errorMessage(error);

    this.logger.warn(
      `Outbox relay failed for ${message.eventName} (${message.eventId}) attempt ${attemptCount}/${options.maxAttempts}: ${errorMessage}`,
    );

    await this.outboxRepository.markFailed({
      id: message.id,
      workerId: options.workerId,
      attemptCount,
      maxAttempts: options.maxAttempts,
      nextAttemptAt: new Date(now.getTime() + retryDelayMs),
      error: errorMessage,
      now,
    });
  }

  private toLocalEventPayload(message: OutboxMessageEntity): Record<string, unknown> {
    const payload = this.hydrateDates(message.payload) as Record<string, unknown>;

    return {
      ...payload,
      eventId: message.eventId,
      eventName: message.eventName,
      occurredAt: message.occurredAt,
      headers: message.headers,
    };
  }

  private hydrateDates(value: unknown): unknown {
    if (Array.isArray(value)) return value.map((item) => this.hydrateDates(item));
    if (!value || typeof value !== 'object') return value;

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => {
        if (typeof item === 'string' && this.isDateField(key)) {
          const date = new Date(item);
          if (!Number.isNaN(date.getTime())) return [key, date];
        }
        return [key, this.hydrateDates(item)];
      }),
    );
  }

  private isDateField(key: string): boolean {
    return key.endsWith('At') || key.endsWith('Date');
  }

  private retryDelayMs(attemptCount: number, options: RelayOutboxBatchOptions): number {
    const delay = options.baseRetryDelayMs * 2 ** Math.max(attemptCount - 1, 0);
    return Math.min(delay, options.maxRetryDelayMs);
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) return error.stack ?? error.message;
    return String(error);
  }
}
