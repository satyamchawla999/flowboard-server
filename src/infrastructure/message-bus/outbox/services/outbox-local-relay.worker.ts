import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { OutboxLocalRelayService, RelayOutboxBatchOptions } from './outbox-local-relay.service';

@Injectable()
export class OutboxLocalRelayWorker implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(OutboxLocalRelayWorker.name);
  private readonly workerId = `${process.pid}-${Math.random().toString(36).slice(2, 10)}`;
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(private readonly relay: OutboxLocalRelayService) {}

  onApplicationBootstrap(): void {
    if (!this.isEnabled()) {
      this.logger.log('Outbox local relay disabled');
      return;
    }

    this.timer = setInterval(() => void this.tick(), this.intervalMs());
    this.timer.unref();
    void this.tick();
    this.logger.log(`Outbox local relay started as ${this.workerId}`);
  }

  onApplicationShutdown(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private async tick(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const result = await this.relay.relayBatch(this.options());
      if (result.claimed > 0) {
        this.logger.debug(
          `Outbox local relay processed claimed=${result.claimed} published=${result.published} failed=${result.failed}`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Outbox local relay tick failed',
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.isRunning = false;
    }
  }

  private options(): RelayOutboxBatchOptions {
    return {
      batchSize: this.numberEnv('OUTBOX_RELAY_BATCH_SIZE', 50),
      workerId: this.workerId,
      maxAttempts: this.numberEnv('OUTBOX_RELAY_MAX_ATTEMPTS', 10),
      lockTtlMs: this.numberEnv('OUTBOX_RELAY_LOCK_TTL_MS', 30_000),
      baseRetryDelayMs: this.numberEnv('OUTBOX_RELAY_BASE_RETRY_DELAY_MS', 1_000),
      maxRetryDelayMs: this.numberEnv('OUTBOX_RELAY_MAX_RETRY_DELAY_MS', 60_000),
    };
  }

  private isEnabled(): boolean {
    return process.env.OUTBOX_LOCAL_RELAY_ENABLED !== 'false';
  }

  private intervalMs(): number {
    return this.numberEnv('OUTBOX_RELAY_INTERVAL_MS', 1_000);
  }

  private numberEnv(key: string, fallback: number): number {
    const value = Number(process.env[key]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }
}
