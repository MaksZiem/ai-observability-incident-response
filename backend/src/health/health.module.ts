import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AlertSchedulerHealthIndicator } from './alert-scheduler.health.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [AlertSchedulerHealthIndicator],
})
export class HealthModule {}
