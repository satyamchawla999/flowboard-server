import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RabbitMqOutboxPublisherService } from '../../rabbitmq/rabbitmq-outbox-publisher.service';
import { OutboxMessageEntity } from '../persistence/outbox-message.entity';
import { OutboxMessageRepository } from '../persistence/outbox-message.repository';
import { OutboxLocalRelayService, RelayOutboxBatchOptions } from './outbox-local-relay.service';

describe('OutboxLocalRelayService', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const options: RelayOutboxBatchOptions = {
    batchSize: 10,
    workerId: 'worker-1',
    maxAttempts: 3,
    lockTtlMs: 30_000,
    baseRetryDelayMs: 1_000,
    maxRetryDelayMs: 60_000,
  };

  it('emits local events and marks messages published', async () => {
    const message = messageEntity({
      eventName: 'task.completed',
      payload: {
        taskId: '8e9de87e-9f14-49a6-bf9f-1f3df3f1c9c2',
        completedAt: '2026-07-15T08:00:00.000Z',
      },
    });
    const repository = repositoryMock([message]);
    const eventEmitter = { emitAsync: jest.fn().mockResolvedValue([]) } as unknown as EventEmitter2;
    const rabbitMqPublisher = publisherMock();
    const service = new OutboxLocalRelayService(repository, eventEmitter, rabbitMqPublisher);

    const result = await service.relayBatch(options);

    expect(result).toEqual({ claimed: 1, published: 1, failed: 0 });
    expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
      'task.completed',
      expect.objectContaining({
        taskId: '8e9de87e-9f14-49a6-bf9f-1f3df3f1c9c2',
        eventId: message.eventId,
        eventName: 'task.completed',
        completedAt: new Date('2026-07-15T08:00:00.000Z'),
        occurredAt: message.occurredAt,
      }),
    );
    expect(repository.markPublished).toHaveBeenCalledWith(
      message.id,
      options.workerId,
      expect.any(Date),
    );
    expect(rabbitMqPublisher.publish).toHaveBeenCalledWith(
      message,
      expect.objectContaining({
        eventId: message.eventId,
        eventName: 'task.completed',
      }),
    );
    expect(repository.markFailed).not.toHaveBeenCalled();
  });

  it('marks listener failures for retry', async () => {
    const message = messageEntity({ attemptCount: 1 });
    const repository = repositoryMock([message]);
    const eventEmitter = {
      emitAsync: jest.fn().mockRejectedValue(new Error('listener failed')),
    } as unknown as EventEmitter2;
    const rabbitMqPublisher = publisherMock();
    const service = new OutboxLocalRelayService(repository, eventEmitter, rabbitMqPublisher);

    const result = await service.relayBatch(options);

    expect(result).toEqual({ claimed: 1, published: 0, failed: 1 });
    expect(rabbitMqPublisher.publish).not.toHaveBeenCalled();
    expect(repository.markPublished).not.toHaveBeenCalled();
    expect(repository.markFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        id: message.id,
        workerId: options.workerId,
        attemptCount: 2,
        maxAttempts: options.maxAttempts,
        error: expect.stringContaining('listener failed'),
        now: expect.any(Date),
        nextAttemptAt: expect.any(Date),
      }),
    );
  });

  it('marks RabbitMQ publish failures for retry', async () => {
    const message = messageEntity({ attemptCount: 0 });
    const repository = repositoryMock([message]);
    const eventEmitter = { emitAsync: jest.fn().mockResolvedValue([]) } as unknown as EventEmitter2;
    const rabbitMqPublisher = publisherMock();
    jest.spyOn(rabbitMqPublisher, 'publish').mockRejectedValue(new Error('broker confirm failed'));
    const service = new OutboxLocalRelayService(repository, eventEmitter, rabbitMqPublisher);

    const result = await service.relayBatch(options);

    expect(result).toEqual({ claimed: 1, published: 0, failed: 1 });
    expect(repository.markPublished).not.toHaveBeenCalled();
    expect(repository.markFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        id: message.id,
        workerId: options.workerId,
        attemptCount: 1,
        error: expect.stringContaining('broker confirm failed'),
      }),
    );
  });

  function repositoryMock(messages: OutboxMessageEntity[]): OutboxMessageRepository {
    return {
      claimPendingBatch: jest.fn().mockResolvedValue(messages),
      markPublished: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
    } as unknown as OutboxMessageRepository;
  }

  function publisherMock(): RabbitMqOutboxPublisherService {
    return {
      publish: jest.fn().mockResolvedValue(undefined),
    } as unknown as RabbitMqOutboxPublisherService;
  }

  function messageEntity(overrides: Partial<OutboxMessageEntity> = {}): OutboxMessageEntity {
    const message = new OutboxMessageEntity();
    message.id = 'a04acb1d-33de-46a3-a873-180be8d07884';
    message.eventId = 'd5ad1b61-11f6-43ed-8f4e-836d6898f662';
    message.eventName = 'workspace.created';
    message.occurredAt = new Date('2026-07-15T07:00:00.000Z');
    message.aggregateId = 'e0fc333a-d08f-409b-bb90-d428a46f285e';
    message.aggregateType = 'WORKSPACE';
    message.workspaceId = 'e0fc333a-d08f-409b-bb90-d428a46f285e';
    message.payload = {
      workspaceId: 'e0fc333a-d08f-409b-bb90-d428a46f285e',
    };
    message.headers = {};
    Object.assign(message, overrides);
    return message;
  }
});
