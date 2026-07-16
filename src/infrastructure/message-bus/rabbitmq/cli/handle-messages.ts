import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../../app.module';
import { RabbitMqConsumerService } from '../rabbitmq-consumer.service';

type CliArgs = Record<string, string | boolean>;

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  applyEnvironmentOverrides(args);

  process.env.OUTBOX_LOCAL_RELAY_ENABLED = 'false';

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const consumer = app.get(RabbitMqConsumerService);
  await consumer.start({
    workerId: stringArg(args, 'worker-id', `consumer-${process.pid}`),
    handlerName: stringArg(
      args,
      'handler',
      process.env.RABBITMQ_HANDLER_NAME ?? 'flowboard.local-event-relay',
    ),
    prefetch: numberArg(args, 'prefetch', 'RABBITMQ_CONSUMER_PREFETCH', 10),
    lockTtlMs: numberArg(args, 'lock-ttl-ms', 'INBOX_LOCK_TTL_MS', 30_000),
    immediateRetries: numberArg(args, 'immediate-retries', 'RABBITMQ_IMMEDIATE_RETRIES', 1),
    maxAttempts: numberArg(args, 'max-attempts', 'RABBITMQ_MAX_DELIVERY_ATTEMPTS', 5),
    retryDelayMs: numberArg(args, 'retry-delay-ms', 'RABBITMQ_RETRY_DELAY_MS', 10_000),
  });

  await waitForShutdown(app);
}

function applyEnvironmentOverrides(args: CliArgs): void {
  setEnv(args, 'db-host', 'DB_HOST');
  setEnv(args, 'db-port', 'DB_PORT');
  setEnv(args, 'db-name', 'DB_NAME');
  setEnv(args, 'db-user', 'DB_USER');
  setEnv(args, 'db-password', 'DB_PASSWORD');
  setEnv(args, 'rabbitmq-dsn', 'RABBITMQ_DSN');
  setEnv(args, 'exchange', 'RABBITMQ_EXCHANGE');
  setEnv(args, 'exchange-type', 'RABBITMQ_EXCHANGE_TYPE');
  setEnv(args, 'queue', 'RABBITMQ_QUEUE');
  setEnv(args, 'binding-key', 'RABBITMQ_QUEUE_BINDING_KEY');
  setEnv(args, 'retry-exchange', 'RABBITMQ_RETRY_EXCHANGE');
  setEnv(args, 'retry-queue', 'RABBITMQ_RETRY_QUEUE');
  setEnv(args, 'retry-routing-key', 'RABBITMQ_RETRY_ROUTING_KEY');
  setEnv(args, 'dead-letter-exchange', 'RABBITMQ_DEAD_LETTER_EXCHANGE');
  setEnv(args, 'dead-letter-queue', 'RABBITMQ_DEAD_LETTER_QUEUE');
  setEnv(args, 'dead-letter-routing-key', 'RABBITMQ_DEAD_LETTER_ROUTING_KEY');
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) continue;

    const [rawKey, inlineValue] = item.slice(2).split('=', 2);
    if (inlineValue !== undefined) {
      args[rawKey] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args[rawKey] = next;
      index += 1;
    } else {
      args[rawKey] = true;
    }
  }

  return args;
}

function setEnv(args: CliArgs, argName: string, envName: string): void {
  const value = args[argName];
  if (value === undefined) return;
  process.env[envName] = String(value);
}

function stringArg(args: CliArgs, name: string, fallback: string): string {
  const value = args[name];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function numberArg(args: CliArgs, name: string, envName: string, fallback: number): number {
  const raw = args[name] ?? process.env[envName];
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

async function waitForShutdown(app: { close: () => Promise<void> }): Promise<void> {
  await new Promise<void>((resolve) => {
    process.once('SIGINT', resolve);
    process.once('SIGTERM', resolve);
  });
  await app.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
