import { Injectable } from '@nestjs/common';
import { OutboxMessageRepository } from '../persistence/outbox-message.repository';
import { DomainEventEnvelopeService } from './domain-event-envelope.service';

@Injectable()
export class DomainEventOutboxService {
  constructor(
    private readonly envelopeService: DomainEventEnvelopeService,
    private readonly outboxRepository: OutboxMessageRepository,
  ) {}

  async store(events: object[]): Promise<void> {
    const envelopes = events
      .map((event) => this.envelopeService.toEnvelope(event))
      .filter((envelope): envelope is NonNullable<typeof envelope> => Boolean(envelope));

    if (!envelopes.length) return;
    await this.outboxRepository.appendMany(envelopes);
  }
}
