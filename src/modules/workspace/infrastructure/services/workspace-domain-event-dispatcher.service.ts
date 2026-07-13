import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

@Injectable()
export class WorkspaceDomainEventDispatcherService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  dispatchAggregateEvents(aggregate: { pullDomainEvents: () => object[] }): void {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      const eventName = (event.constructor as { EVENT_NAME?: string }).EVENT_NAME;
      if (eventName) this.eventEmitter.emit(eventName, event);
    }
  }
}
