import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GraphQLExceptionFilter } from './common/exceptions/graphql-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    // Structured JSON logging in production; pretty-print in dev.
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['debug', 'log', 'warn', 'error', 'verbose'],
  });

  app.getHttpAdapter().get('/favicon.ico', (req, res) => {
    res.status(204).end(); // 204 No Content
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port') ?? 4000;

  // Global validation — rejects invalid inputs before they reach application code.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties instead of silently stripping
      transform: true, // Auto-transform payloads to DTO class instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Translate domain/application errors to GraphQL errors at the boundary.
  app.useGlobalFilters(new GraphQLExceptionFilter());

  // Request/response logging for every GraphQL operation.
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
  logger.log(`FlowBoard running on http://localhost:${port}/graphql`);
}

bootstrap();
