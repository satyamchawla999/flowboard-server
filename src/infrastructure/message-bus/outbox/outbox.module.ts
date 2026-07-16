import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RabbitMqOutboxPublisherService } from '../rabbitmq/rabbitmq-outbox-publisher.service';
import { OutboxMessageEntity } from './persistence/outbox-message.entity';
import { OutboxMessageRepository } from './persistence/outbox-message.repository';
import { DomainEventEnvelopeService } from './services/domain-event-envelope.service';
import { DomainEventOutboxService } from './services/domain-event-outbox.service';
import { OutboxLocalRelayService } from './services/outbox-local-relay.service';
import { OutboxLocalRelayWorker } from './services/outbox-local-relay.worker';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([OutboxMessageEntity])],
  providers: [
    DomainEventEnvelopeService,
    DomainEventOutboxService,
    OutboxLocalRelayService,
    OutboxLocalRelayWorker,
    RabbitMqOutboxPublisherService,
    OutboxMessageRepository,
  ],
  exports: [DomainEventOutboxService, OutboxLocalRelayService],
})
export class OutboxModule {}
