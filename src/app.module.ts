import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { join } from 'path';
import type { Request } from 'express';

import { appConfig, databaseConfig, jwtConfig, mailConfig } from './infrastructure/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { MikroOrmTransactionalAdapter } from './infrastructure/database/mikro-orm-transactional.adapter';
import { DateTimeScalar } from './common/scalars/date.scalar';
import { JsonScalar } from './common/scalars/json.scalar';
import { JwtAuthGuard } from './modules/identity/infrastructure/auth/jwt-auth.guard';

// --- Domain Modules ---
import { IdentityModule } from './modules/identity/identity.module';
import { TaskModule } from './modules/task/task.module';
import { ProjectModule } from './modules/project/project.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { MembershipModule } from './modules/membership/membership.module';
import { ActivityModule } from './modules/activity/activity.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

@Module({
  imports: [
    // Config must be first — all other modules depend on it.
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, databaseConfig, jwtConfig, mailConfig],
    }),

    // EventEmitter2 for internal domain events.
    // wildcard: true allows listeners like 'task.*' to catch all task events.
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),

    ClsModule.forRoot({
      global: true,
      plugins: [
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new MikroOrmTransactionalAdapter(),
        }),
      ],
    }),

    // GraphQL code-first. The schema is auto-generated from decorators.
    // autoSchemaFile in dev writes the SDL to disk for introspection tools.
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,

      // 1. Explicitly turn off NestJS's internal landing page/playground handler
      playground: false,

      introspection: process.env.NODE_ENV !== 'production',

      // 2. Your custom Apollo Server v4 plugin will now register without conflict
      plugins: [ApolloServerPluginLandingPageLocalDefault()],

      context: ({ req }: { req: Request }) => ({ req }),
    }),

    DatabaseModule,

    // Domain modules
    IdentityModule,
    TaskModule,
    ProjectModule,
    WorkspaceModule,
    MembershipModule,
    ActivityModule,
  ],
  providers: [
    DateTimeScalar,
    JsonScalar,
    // Global JWT guard — all resolvers require auth unless marked @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
