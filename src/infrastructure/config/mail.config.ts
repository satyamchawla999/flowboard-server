import { registerAs } from '@nestjs/config';

export const mailConfig = registerAs('mail', () => ({
  enabled: process.env.MAIL_ENABLED === 'true',
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT ?? '587', 10),
  secure: process.env.MAIL_SECURE === 'true',
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  fromName: process.env.MAIL_FROM_NAME ?? process.env.APP_NAME ?? 'FlowBoard',
  fromAddress: process.env.MAIL_FROM_ADDRESS ?? 'no-reply@flowboard.local',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
}));
