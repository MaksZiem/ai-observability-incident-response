import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { IngestQueueService } from '../ingest/ingest-queue.service.js';

const CHECK_TIMEOUT_MS = 2000;

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Redis did not respond in time')), ms);
  });
}

@Injectable()
export class IngestQueueHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly queueService: IngestQueueService,
  ) {}

  async check(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const depth = await Promise.race([
        this.queueService.depth(),
        timeout(CHECK_TIMEOUT_MS),
      ]);
      return indicator.up({ ...depth });
    } catch (error) {
      return indicator.down({
        message:
          error instanceof Error ? error.message : 'Redis is unreachable',
      });
    }
  }
}
