import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  name: process.env.DB_NAME ?? 'flowboard_dev',
  user: process.env.DB_USER ?? 'flowboard',
  password: process.env.DB_PASSWORD ?? 'flowboard_secret',
}));
