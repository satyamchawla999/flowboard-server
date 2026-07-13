import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TaskDomainEventDispatcherService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  dispatchAggregateEvents(aggregate: { pullDomainEvents(): object[] }): void {
    for (const event of aggregate.pullDomainEvents()) {
      const eventName = (event.constructor as { EVENT_NAME?: string }).EVENT_NAME;
      if (eventName) this.eventEmitter.emit(eventName, event);
    }
  }
}
