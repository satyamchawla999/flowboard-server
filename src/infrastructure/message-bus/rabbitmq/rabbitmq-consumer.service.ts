import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as amqp from 'amqplib';
import { createHash } from 'crypto';
import { InboxIdempotencyService } from '../inbox/services/inbox-idempotency.service';

type RabbitMqConnection = Awaited<ReturnType<typeof amqp.connect>>;
type RabbitMqChannel = Awaited<ReturnType<RabbitMqConnection['createChannel']>>;
type RabbitMqMessage = NonNullable<Parameters<RabbitMqChannel['ack']>[0]>;

export interface RabbitMqConsumerOptions {
  workerId: string;
  handlerName: string;
  prefetch: number;
  lockTtlMs: number;
  immediateRetries: number;
  maxAttempts: number;
  retryDelayMs: number;
}

@Injectable()
export class RabbitMqConsumerService implements OnApplicationShutdown {
  private readonly logger = new Logger(RabbitMqConsumerService.name);
  private connection: RabbitMqConnection | null = null;
  private channel: RabbitMqChannel | null = null;

  constructor(
    private readonly inbox: InboxIdempotencyService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async start(options: RabbitMqConsumerOptions): Promise<void> {
    const channel = await this.getChannel();
    await this.assertTopology(channel);
    await channel.prefetch(options.prefetch);

    await channel.consume(
      this.primaryQueue(),
      (message) => void this.handleMessage(message, options),
      {
        noAck: false,
      },
    );

    this.logger.log(`RabbitMQ consumer started on ${this.primaryQueue()} as ${options.workerId}`);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.close();
  }

  private async handleMessage(
    message: RabbitMqMessage | null,
    options: RabbitMqConsumerOptions,
  ): Promise<void> {
    if (!message || !this.channel) return;

    const channel = this.channel;
    const incoming = this.toIncomingMessage(message, options.handlerName);
    const processing = await this.inbox.beginProcessing(incoming, {
      workerId: options.workerId,
      lockTtlMs: options.lockTtlMs,
    });

    if (processing.alreadyProcessed) {
      channel.ack(message);
      return;
    }
    if (!processing.shouldProcess || !processing.inboxMessage) {
      channel.nack(message, false, true);
      return;
    }

    try {
      await this.executeWithImmediateRetries(incoming.eventName, incoming.payload, options);
      await this.inbox.markProcessed(processing.inboxMessage, options.workerId);
      channel.ack(message);
    } catch (error) {
      const attemptCount = this.deliveryAttempt(message) + 1;
      const shouldDeadLetter = attemptCount >= options.maxAttempts;
      await this.inbox.markFailed(
        processing.inboxMessage,
        options.workerId,
        attemptCount,
        error,
        shouldDeadLetter ? null : new Date(Date.now() + options.retryDelayMs),
      );

      if (shouldDeadLetter) {
        await this.deadLetter(channel, message, error, attemptCount);
      } else {
        await this.retry(channel, message, error, attemptCount, options.retryDelayMs);
      }

      channel.ack(message);
    }
  }

  private async executeWithImmediateRetries(
    eventName: string,
    payload: Record<string, unknown>,
    options: RabbitMqConsumerOptions,
  ): Promise<void> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= options.immediateRetries; attempt += 1) {
      try {
        await this.eventEmitter.emitAsync(eventName, this.hydrateDates(payload));
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }

  private async retry(
    channel: RabbitMqChannel,
    message: RabbitMqMessage,
    error: unknown,
    attemptCount: number,
    retryDelayMs: number,
  ): Promise<void> {
    this.logger.warn(
      `Retrying RabbitMQ message ${this.messageId(message)} after ${retryDelayMs}ms: ${this.errorMessage(error)}`,
    );

    channel.publish(this.retryExchange(), this.retryRoutingKey(), message.content, {
      ...message.properties,
      persistent: true,
      expiration: String(retryDelayMs),
      headers: {
        ...(message.properties.headers ?? {}),
        redelivery_count: attemptCount,
        last_error: this.errorMessage(error),
      },
    });
  }

  private async deadLetter(
    channel: RabbitMqChannel,
    message: RabbitMqMessage,
    error: unknown,
    attemptCount: number,
  ): Promise<void> {
    this.logger.error(
      `Dead-lettering RabbitMQ message ${this.messageId(message)} after ${attemptCount} attempts: ${this.errorMessage(error)}`,
    );

    channel.publish(this.deadLetterExchange(), this.deadLetterRoutingKey(), message.content, {
      ...message.properties,
      persistent: true,
      headers: {
        ...(message.properties.headers ?? {}),
        redelivery_count: attemptCount,
        dead_lettered_at: new Date().toISOString(),
        last_error: this.errorMessage(error),
      },
    });
  }

  private toIncomingMessage(message: RabbitMqMessage, handlerName: string) {
    const payload = this.parsePayload(message);
    const headers = message.properties.headers ?? {};
    const eventName = this.eventName(message, payload);

    return {
      messageId: this.messageId(message),
      handlerName,
      eventName,
      workspaceId: this.stringValue(headers.workspaceId) ?? this.stringValue(payload.workspaceId),
      payload: {
        ...payload,
        eventId: this.messageId(message),
        eventName,
        headers,
      },
      headers,
    };
  }

  private async getChannel(): Promise<RabbitMqChannel> {
    if (this.channel) return this.channel;

    this.connection = await amqp.connect(this.dsnWithHeartbeat(), {
      clientProperties: {
        connection_name: process.env.RABBITMQ_CONSUMER_CONNECTION_NAME ?? 'flowboard-consumer',
      },
    });
    this.connection.on('close', () => this.resetConnection('RabbitMQ consumer connection closed'));
    this.connection.on('error', (error) =>
      this.resetConnection(`RabbitMQ consumer connection error: ${error.message}`),
    );

    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  private async assertTopology(channel: RabbitMqChannel): Promise<void> {
    await channel.assertExchange(this.primaryExchange(), this.exchangeType(), { durable: true });
    await channel.assertExchange(this.retryExchange(), this.exchangeType(), { durable: true });
    await channel.assertExchange(this.deadLetterExchange(), this.exchangeType(), { durable: true });

    await channel.assertQueue(this.primaryQueue(), { durable: true });
    await channel.bindQueue(this.primaryQueue(), this.primaryExchange(), this.primaryBindingKey());

    await channel.assertQueue(this.retryQueue(), {
      durable: true,
      deadLetterExchange: this.primaryExchange(),
    });
    await channel.bindQueue(this.retryQueue(), this.retryExchange(), this.retryRoutingKey());

    await channel.assertQueue(this.deadLetterQueue(), { durable: true });
    await channel.bindQueue(
      this.deadLetterQueue(),
      this.deadLetterExchange(),
      this.deadLetterRoutingKey(),
    );
  }

  private resetConnection(message: string): void {
    this.logger.warn(message);
    this.channel = null;
    this.connection = null;
  }

  private async close(): Promise<void> {
    const channel = this.channel;
    const connection = this.connection;
    this.channel = null;
    this.connection = null;

    await channel?.close().catch(() => undefined);
    await connection?.close().catch(() => undefined);
  }

  private parsePayload(message: RabbitMqMessage): Record<string, unknown> {
    try {
      const parsed = JSON.parse(message.content.toString()) as unknown;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  private hydrateDates(value: unknown): unknown {
    if (Array.isArray(value)) return value.map((item) => this.hydrateDates(item));
    if (!value || typeof value !== 'object') return value;

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => {
        if (typeof item === 'string' && (key.endsWith('At') || key.endsWith('Date'))) {
          const date = new Date(item);
          if (!Number.isNaN(date.getTime())) return [key, date];
        }
        return [key, this.hydrateDates(item)];
      }),
    );
  }

  private eventName(message: RabbitMqMessage, payload: Record<string, unknown>): string {
    return (
      this.stringValue(message.properties.type) ??
      this.stringValue(message.properties.headers?.eventName) ??
      this.stringValue(payload.eventName) ??
      message.fields.routingKey
    );
  }

  private messageId(message: RabbitMqMessage): string {
    return (
      this.stringValue(message.properties.messageId) ??
      this.stringValue(message.properties.headers?.eventId) ??
      this.contentHash(message)
    );
  }

  private contentHash(message: RabbitMqMessage): string {
    return createHash('sha256')
      .update(message.fields.routingKey)
      .update(this.stringValue(message.properties.type) ?? '')
      .update(message.content)
      .digest('hex');
  }

  private deliveryAttempt(message: RabbitMqMessage): number {
    const value = Number(message.properties.headers?.redelivery_count ?? 0);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  private dsn(): string {
    return process.env.RABBITMQ_DSN ?? 'amqp://localhost:5672';
  }

  private dsnWithHeartbeat(): string {
    const dsn = new URL(this.dsn());
    dsn.searchParams.set('heartbeat', String(this.numberEnv('RABBITMQ_HEARTBEAT_SECONDS', 30)));
    return dsn.toString();
  }

  private primaryExchange(): string {
    return process.env.RABBITMQ_EXCHANGE ?? 'flowboard.events';
  }

  private exchangeType(): string {
    return process.env.RABBITMQ_EXCHANGE_TYPE ?? 'topic';
  }

  private primaryQueue(): string {
    return process.env.RABBITMQ_QUEUE ?? 'flowboard.events';
  }

  private primaryBindingKey(): string {
    return process.env.RABBITMQ_QUEUE_BINDING_KEY ?? 'flowboard.#';
  }

  private retryExchange(): string {
    return process.env.RABBITMQ_RETRY_EXCHANGE ?? 'flowboard.events.retry';
  }

  private retryQueue(): string {
    return process.env.RABBITMQ_RETRY_QUEUE ?? 'flowboard.events.retry';
  }

  private retryRoutingKey(): string {
    return process.env.RABBITMQ_RETRY_ROUTING_KEY ?? 'flowboard.retry';
  }

  private deadLetterExchange(): string {
    return process.env.RABBITMQ_DEAD_LETTER_EXCHANGE ?? 'flowboard.events.dlx';
  }

  private deadLetterQueue(): string {
    return process.env.RABBITMQ_DEAD_LETTER_QUEUE ?? 'flowboard.events.dlq';
  }

  private deadLetterRoutingKey(): string {
    return process.env.RABBITMQ_DEAD_LETTER_ROUTING_KEY ?? 'flowboard.dead';
  }

  private numberEnv(key: string, fallback: number): number {
    const value = Number(process.env[key]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private errorMessage(error: unknown): string {
    if (error instanceof Error) return error.stack ?? error.message;
    return String(error);
  }
}
