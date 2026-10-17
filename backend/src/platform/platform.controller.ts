import { Controller, Get } from '@nestjs/common';
import { PlatformStatsService } from './platform-stats.service.js';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformStats: PlatformStatsService) {}

  @Get('stats')
  getStats() {
    return this.platformStats.snapshot();
  }
}
