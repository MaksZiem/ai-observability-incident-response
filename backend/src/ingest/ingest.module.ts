import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DeploymentsModule } from '../deployments/deployments.module.js';
import { ErrorsModule } from '../errors/errors.module.js';
import { LogsModule } from '../logs/logs.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { TracesModule } from '../traces/traces.module.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';
import { DEAD_LETTER_QUEUE, INGEST_QUEUE } from './ingest-queue.js';
import { IngestQueueService } from './ingest-queue.service.js';
import { IngestController } from './ingest.controller.js';
import { IngestProcessor } from './ingest.processor.js';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: INGEST_QUEUE },
      { name: DEAD_LETTER_QUEUE },
    ),
    ProjectsModule,
    LogsModule,
    TracesModule,
    ErrorsModule,
    DeploymentsModule,
  ],
  controllers: [IngestController],
  providers: [ApiKeyGuard, IngestQueueService, IngestProcessor],
  exports: [IngestQueueService],
})
export class IngestModule {}
