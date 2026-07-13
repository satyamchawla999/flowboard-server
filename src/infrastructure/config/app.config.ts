import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  name: process.env.APP_NAME ?? 'FlowBoard',
  port: parseInt(process.env.PORT ?? '4000', 10),
  isProduction: process.env.NODE_ENV === 'production',
}));
