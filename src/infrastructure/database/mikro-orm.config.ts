import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';
import * as dotenv from 'dotenv';

dotenv.config();

// This file is used by the MikroORM CLI (migration:create, migration:up, etc.)
// It runs outside of NestJS context, so it reads env directly.
export default defineConfig({
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  dbName: process.env.DB_NAME ?? 'flowboard_dev',
  user: process.env.DB_USER ?? 'flowboard',
  password: process.env.DB_PASSWORD ?? 'flowboard_secret',

  // Entities are registered per-module via MikroOrmModule.forFeature()
  // The glob here covers all compiled entity files for CLI migrations.
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],

  migrations: {
    path: 'src/infrastructure/database/migrations',
    pathTs: 'src/infrastructure/database/migrations',
    glob: '!(*.d).{js,ts}',
  },

  seeder: {
    path: 'src/infrastructure/database/seeders',
    pathTs: 'src/infrastructure/database/seeders',
    glob: '!(*.d).{js,ts}',
    defaultSeeder: 'DatabaseSeeder',
  },

  extensions: [Migrator, SeedManager],

  debug: process.env.NODE_ENV === 'development',
});
