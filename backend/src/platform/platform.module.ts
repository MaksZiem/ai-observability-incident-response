import { Global, Module } from '@nestjs/common';
import { PlatformController } from './platform.controller.js';
import { PlatformStatsService } from './platform-stats.service.js';

@Global()
@Module({
  controllers: [PlatformController],
  providers: [PlatformStatsService],
  exports: [PlatformStatsService],
})
export class PlatformModule {}
