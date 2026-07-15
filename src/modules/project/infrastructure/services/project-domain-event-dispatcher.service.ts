import { Injectable } from '@nestjs/common';
import { DomainEventOutboxService } from '@infrastructure/message-bus/outbox/services/domain-event-outbox.service';

@Injectable()
export class ProjectDomainEventDispatcherService {
  constructor(private readonly outbox: DomainEventOutboxService) {}

  async dispatchAggregateEvents(aggregate: { pullDomainEvents: () => object[] }): Promise<void> {
    await this.outbox.store(aggregate.pullDomainEvents());
  }
}
