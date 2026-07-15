import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OutboxMessageEntity } from './persistence/outbox-message.entity';
import { OutboxMessageRepository } from './persistence/outbox-message.repository';
import { DomainEventEnvelopeService } from './services/domain-event-envelope.service';
import { DomainEventOutboxService } from './services/domain-event-outbox.service';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([OutboxMessageEntity])],
  providers: [DomainEventEnvelopeService, DomainEventOutboxService, OutboxMessageRepository],
  exports: [DomainEventOutboxService],
})
export class OutboxModule {}
