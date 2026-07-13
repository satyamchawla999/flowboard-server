import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { TaskEntity } from './infrastructure/persistence/mikro-orm/entities/task.entity';
import { TaskMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/task.mikro-orm.repository';
import { TaskMapper } from './infrastructure/persistence/mikro-orm/mappers/task.mapper';

import { TaskService } from './application/services/task.service';
import { TaskResolver } from './presentation/graphql/resolvers/task.resolver';
import { TASK_REPOSITORY } from './domain/contracts/task.repository';

/**
 * Module wires everything together. This is the only place that knows about
 * both the domain contract and the infrastructure implementation.
 *
 * Why use a Symbol token for the repository: it prevents accidental collisions
 * if two modules both provide "TaskRepository", and makes the dependency
 * injection explicit. The application service never imports the concrete
 * implementation — only the Symbol token.
 */
@Module({
  imports: [MikroOrmModule.forFeature([TaskEntity])],
  providers: [
    TaskMapper,
    {
      provide: TASK_REPOSITORY,
      useClass: TaskMikroOrmRepository,
    },
    TaskService,
    TaskResolver,
  ],
  exports: [TaskService],
})
export class TaskModule {}
