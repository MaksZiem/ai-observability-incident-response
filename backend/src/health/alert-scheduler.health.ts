import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { PlatformStatsService } from '../platform/platform-stats.service.js';

const MAX_SILENCE_MS = 3 * 60_000;

@Injectable()
export class AlertSchedulerHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly platformStats: PlatformStatsService,
  ) {}

  check(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    const lastRunAt = this.platformStats.lastAlertRunAt();
    const silentForMs =
      Date.now() - (lastRunAt ?? this.platformStats.startedAt).getTime();

    return silentForMs <= MAX_SILENCE_MS
      ? indicator.up({ lastRunAt })
      : indicator.down({
          lastRunAt,
          message: 'Alert evaluation has not run recently',
        });
  }
}
