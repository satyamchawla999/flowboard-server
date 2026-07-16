import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../../app.module';
import { OutboxLocalRelayService } from '../services/outbox-local-relay.service';

type CliArgs = Record<string, string | boolean>;

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  applyEnvironmentOverrides(args);

  process.env.OUTBOX_LOCAL_RELAY_ENABLED = 'false';

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const relay = app.get(OutboxLocalRelayService);
    const result = await relay.relayBatch({
      batchSize: numberArg(args, 'limit', 'OUTBOX_RELAY_BATCH_SIZE', 50),
      workerId: stringArg(args, 'worker-id', `cli-${process.pid}`),
      maxAttempts: numberArg(args, 'max-attempts', 'OUTBOX_RELAY_MAX_ATTEMPTS', 10),
      lockTtlMs: numberArg(args, 'lock-ttl-ms', 'OUTBOX_RELAY_LOCK_TTL_MS', 30_000),
      baseRetryDelayMs: numberArg(
        args,
        'base-retry-delay-ms',
        'OUTBOX_RELAY_BASE_RETRY_DELAY_MS',
        1_000,
      ),
      maxRetryDelayMs: numberArg(
        args,
        'max-retry-delay-ms',
        'OUTBOX_RELAY_MAX_RETRY_DELAY_MS',
        60_000,
      ),
    });

    console.log(JSON.stringify(result));
  } finally {
    await app.close();
  }
}

function applyEnvironmentOverrides(args: CliArgs): void {
  setEnv(args, 'db-host', 'DB_HOST');
  setEnv(args, 'db-port', 'DB_PORT');
  setEnv(args, 'db-name', 'DB_NAME');
  setEnv(args, 'db-user', 'DB_USER');
  setEnv(args, 'db-password', 'DB_PASSWORD');
  setEnv(args, 'rabbitmq', 'RABBITMQ_DISPATCH_ENABLED');
  setEnv(args, 'rabbitmq-dsn', 'RABBITMQ_DSN');
  setEnv(args, 'exchange', 'RABBITMQ_EXCHANGE');
  setEnv(args, 'exchange-type', 'RABBITMQ_EXCHANGE_TYPE');
  setEnv(args, 'routing-key-prefix', 'RABBITMQ_ROUTING_KEY_PREFIX');
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
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
