import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { IngestModule } from '../ingest/ingest.module.js';
import { AlertSchedulerHealthIndicator } from './alert-scheduler.health.js';
import { HealthController } from './health.controller.js';
import { IngestQueueHealthIndicator } from './ingest-queue.health.js';

@Module({
  imports: [TerminusModule, IngestModule],
  controllers: [HealthController],
  providers: [AlertSchedulerHealthIndicator, IngestQueueHealthIndicator],
})
export class HealthModule {}
