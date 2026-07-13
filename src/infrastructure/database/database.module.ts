import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigService } from '@nestjs/config';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      driver: PostgreSqlDriver,
      useFactory: (config: ConfigService) => ({
        driver: PostgreSqlDriver,
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        dbName: config.get<string>('database.name'),
        user: config.get<string>('database.user'),
        password: config.get<string>('database.password'),

        // Entities registered here via glob — modules register their own via forFeature()
        entities: ['dist/**/*.entity.js'],
        entitiesTs: ['src/**/*.entity.ts'],

        migrations: {
          path: 'src/infrastructure/database/migrations',
          pathTs: 'src/infrastructure/database/migrations',
        },

        extensions: [Migrator, SeedManager],

        // Runs pending migrations automatically on startup in dev.
        // In production, prefer running migrations as a separate deploy step.
        autoMigrate: config.get<string>('app.nodeEnv') !== 'production',

        debug: config.get<string>('app.nodeEnv') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
