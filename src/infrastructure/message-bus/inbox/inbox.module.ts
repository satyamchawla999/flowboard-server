import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RabbitMqConsumerService } from '../rabbitmq/rabbitmq-consumer.service';
import { InboxMessageEntity } from './persistence/inbox-message.entity';
import { InboxMessageRepository } from './persistence/inbox-message.repository';
import { InboxIdempotencyService } from './services/inbox-idempotency.service';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([InboxMessageEntity])],
  providers: [InboxIdempotencyService, InboxMessageRepository, RabbitMqConsumerService],
  exports: [InboxIdempotencyService, RabbitMqConsumerService],
})
export class InboxModule {}
