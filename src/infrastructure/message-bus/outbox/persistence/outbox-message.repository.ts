import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { DomainEventEnvelope } from '../domain/domain-event-envelope';
import { OutboxMessageEntity } from './outbox-message.entity';

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
