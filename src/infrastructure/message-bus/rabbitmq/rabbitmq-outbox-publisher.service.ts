import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import * as amqp from 'amqplib';
import { OutboxMessageEntity } from '../outbox/persistence/outbox-message.entity';

type RabbitMqConnection = Awaited<ReturnType<typeof amqp.connect>>;
type RabbitMqConfirmChannel = Awaited<ReturnType<RabbitMqConnection['createConfirmChannel']>>;

@Injectable()
export class RabbitMqOutboxPublisherService implements OnApplicationShutdown {
  private readonly logger = new Logger(RabbitMqOutboxPublisherService.name);
  private connection: RabbitMqConnection | null = null;
  private channel: RabbitMqConfirmChannel | null = null;

  async publish(message: OutboxMessageEntity, payload: Record<string, unknown>): Promise<void> {
    if (!this.isEnabled()) return;

    const channel = await this.getChannel();
    const routingKey = this.routingKey(message.eventName);
    const content = Buffer.from(JSON.stringify(payload));

    channel.publish(this.exchange(), routingKey, content, {
      contentType: 'application/json',
      deliveryMode: 2,
      persistent: true,
      messageId: message.eventId,
      type: message.eventName,
      timestamp: Math.floor(message.occurredAt.getTime() / 1000),
      headers: {
        ...message.headers,
        eventId: message.eventId,
        eventName: message.eventName,
        aggregateId: message.aggregateId,
        aggregateType: message.aggregateType,
        workspaceId: message.workspaceId,
      },
    });

    await channel.waitForConfirms();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.close();
  }

  private async getChannel(): Promise<RabbitMqConfirmChannel> {
    if (this.channel) return this.channel;

    this.connection = await amqp.connect(this.dsnWithHeartbeat(), {
      clientProperties: {
        connection_name: process.env.RABBITMQ_CONNECTION_NAME ?? 'flowboard-outbox-publisher',
      },
    });
    this.connection.on('close', () => this.resetConnection('RabbitMQ connection closed'));
    this.connection.on('error', (error) =>
      this.resetConnection(`RabbitMQ connection error: ${error.message}`),
    );

    this.channel = await this.connection.createConfirmChannel();
    await this.channel.assertExchange(this.exchange(), this.exchangeType(), { durable: true });
    return this.channel;
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

  private isEnabled(): boolean {
    return process.env.RABBITMQ_DISPATCH_ENABLED === 'true';
  }

  private dsn(): string {
    return process.env.RABBITMQ_DSN ?? 'amqp://localhost:5672';
  }

  private dsnWithHeartbeat(): string {
    const dsn = new URL(this.dsn());
    dsn.searchParams.set('heartbeat', String(this.numberEnv('RABBITMQ_HEARTBEAT_SECONDS', 30)));
    return dsn.toString();
  }

  private exchange(): string {
    return process.env.RABBITMQ_EXCHANGE ?? 'flowboard.events';
  }

  private exchangeType(): string {
    return process.env.RABBITMQ_EXCHANGE_TYPE ?? 'topic';
  }

  private routingKey(eventName: string): string {
    const prefix = process.env.RABBITMQ_ROUTING_KEY_PREFIX?.trim();
    return prefix ? `${prefix}.${eventName}` : eventName;
  }

  private numberEnv(key: string, fallback: number): number {
    const value = Number(process.env[key]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }
}
