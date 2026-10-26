import { Controller, Get } from '@nestjs/common';
import { PlatformStatsService } from './platform-stats.service.js';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformStats: PlatformStatsService) {}

  @Get('stats')
  async getStats() {
    return {
      ...this.platformStats.snapshot(),
      queue: await this.platformStats.queueDepth(),
    };
  }
}
