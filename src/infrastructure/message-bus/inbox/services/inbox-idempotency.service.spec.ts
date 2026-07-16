import { InboxMessageEntity } from '../persistence/inbox-message.entity';
import { InboxMessageRepository } from '../persistence/inbox-message.repository';
import { InboxIdempotencyService, IncomingInboxMessage } from './inbox-idempotency.service';

describe('InboxIdempotencyService', () => {
  const incoming: IncomingInboxMessage = {
    messageId: 'message-1',
    handlerName: 'flowboard.local-event-relay',
    eventName: 'project.created',
    workspaceId: 'b9192700-b4fb-4d8b-a3ab-2a9f340a45ab',
    payload: { projectId: '0d016859-8ef9-4fea-929b-71cd7387b0fb' },
    headers: { eventName: 'project.created' },
  };

  it('starts processing when the inbox row is acquired', async () => {
    const inboxMessage = new InboxMessageEntity();
    inboxMessage.id = 'a7918d5e-d3c0-40c2-9f1c-ea38f66c858d';
    const repository = repositoryMock({
      acquired: true,
      alreadyProcessed: false,
      inboxMessage,
    });
    const service = new InboxIdempotencyService(repository);

    const result = await service.beginProcessing(incoming, {
      workerId: 'worker-1',
      lockTtlMs: 30_000,
    });

    expect(result).toEqual({
      shouldProcess: true,
      alreadyProcessed: false,
      inboxMessage,
    });
    expect(repository.startProcessing).toHaveBeenCalledWith(
      expect.objectContaining({
        ...incoming,
        workerId: 'worker-1',
        lockTtlMs: 30_000,
        now: expect.any(Date),
      }),
    );
  });

  it('reports already processed messages without processing them again', async () => {
    const repository = repositoryMock({
      acquired: false,
      alreadyProcessed: true,
      inboxMessage: null,
    });
    const service = new InboxIdempotencyService(repository);

    const result = await service.beginProcessing(incoming, {
      workerId: 'worker-1',
      lockTtlMs: 30_000,
    });

    expect(result.shouldProcess).toBe(false);
    expect(result.alreadyProcessed).toBe(true);
  });

  function repositoryMock(
    startResult: Awaited<ReturnType<InboxMessageRepository['startProcessing']>>,
  ): InboxMessageRepository {
    return {
      startProcessing: jest.fn().mockResolvedValue(startResult),
      markProcessed: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn().mockResolvedValue(undefined),
    } as unknown as InboxMessageRepository;
  }
});
