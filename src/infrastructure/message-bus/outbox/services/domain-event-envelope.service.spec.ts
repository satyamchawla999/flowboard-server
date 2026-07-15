import { TaskCreatedEvent } from '@modules/task/domain/events/task-created.event';
import { WorkspaceCreatedEvent } from '@modules/workspace/domain/events/workspace-created.event';
import { DomainEventEnvelopeService } from './domain-event-envelope.service';

describe('DomainEventEnvelopeService', () => {
  const service = new DomainEventEnvelopeService();

  it('wraps workspace events with workspace aggregate metadata', () => {
    const workspaceId = '72e7f1e1-8c87-4ec7-b8f7-84a5d7d68712';
    const event = new WorkspaceCreatedEvent(
      workspaceId,
      'FlowBoard',
      'flowboard',
      '9d759518-93b1-4ff1-bd70-52ad6300cc8b',
    );

    const envelope = service.toEnvelope(event);

    expect(envelope).toMatchObject({
      eventName: WorkspaceCreatedEvent.EVENT_NAME,
      aggregateId: workspaceId,
      aggregateType: 'WORKSPACE',
      workspaceId,
      payload: {
        workspaceId,
        name: 'FlowBoard',
        slug: 'flowboard',
        ownerId: '9d759518-93b1-4ff1-bd70-52ad6300cc8b',
      },
      headers: {
        eventName: WorkspaceCreatedEvent.EVENT_NAME,
        aggregateId: workspaceId,
        aggregateType: 'WORKSPACE',
        contentType: 'application/json',
      },
    });
    expect(envelope?.eventId).toEqual(envelope?.headers.eventId);
    expect(envelope?.occurredAt).toBeInstanceOf(Date);
  });

  it('wraps task events with task aggregate metadata and workspace scope', () => {
    const taskId = '6b9f7afb-bf02-4b71-b7a1-0f306709e0f1';
    const workspaceId = 'e2452658-af77-4b8f-a47a-1d0dd96fd96f';
    const event = new TaskCreatedEvent(
      taskId,
      workspaceId,
      'b3e4e017-dd5b-4daa-925e-c3367d1f398a',
      'f2573ba7-651d-4ef5-ad2a-5e9d43df681d',
      '07f11bdb-f56f-4f36-8a84-02c09f4607f2',
    );

    const envelope = service.toEnvelope(event);

    expect(envelope).toMatchObject({
      eventName: TaskCreatedEvent.EVENT_NAME,
      aggregateId: taskId,
      aggregateType: 'TASK',
      workspaceId,
      payload: {
        taskId,
        workspaceId,
        projectId: 'b3e4e017-dd5b-4daa-925e-c3367d1f398a',
        sectionId: 'f2573ba7-651d-4ef5-ad2a-5e9d43df681d',
        reporterUserId: '07f11bdb-f56f-4f36-8a84-02c09f4607f2',
      },
      headers: {
        eventName: TaskCreatedEvent.EVENT_NAME,
        aggregateId: taskId,
        aggregateType: 'TASK',
        contentType: 'application/json',
      },
    });
    expect(envelope?.eventId).toEqual(envelope?.headers.eventId);
    expect(envelope?.occurredAt).toBeInstanceOf(Date);
  });

  it('ignores objects without an event name', () => {
    expect(service.toEnvelope({ taskId: '6b9f7afb-bf02-4b71-b7a1-0f306709e0f1' })).toBeNull();
  });
});
