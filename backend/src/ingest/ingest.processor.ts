import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { ErrorsService } from '../errors/errors.service.js';
import { LogsService } from '../logs/logs.service.js';
import { PlatformStatsService } from '../platform/platform-stats.service.js';
import { TracesService } from '../traces/traces.service.js';
import {
  INGEST_QUEUE,
  INGEST_WORKER_CONCURRENCY,
  IngestJobData,
} from './ingest-queue.js';
import { IngestQueueService } from './ingest-queue.service.js';

@Processor(INGEST_QUEUE, { concurrency: INGEST_WORKER_CONCURRENCY })
export class IngestProcessor extends WorkerHost {
  private readonly logger = new Logger(IngestProcessor.name);

  constructor(
    private readonly logsService: LogsService,
    private readonly tracesService: TracesService,
    private readonly errorsService: ErrorsService,
    private readonly queueService: IngestQueueService,
    private readonly platformStats: PlatformStatsService,
  ) {
    super();
  }

  async process(job: Job<IngestJobData>): Promise<void> {
    const { data } = job;

    switch (data.type) {
      case 'logs':
        await this.logsService.createMany(data.projectId, data.items);
        break;
      case 'spans':
        await this.tracesService.createMany(data.projectId, data.items);
        break;
      case 'errors':
        await this.errorsService.ingest(data.projectId, data.items);
        break;
    }

    this.platformStats.recordIngestStored(
      data.type,
      data.items.length,
      Date.now() - job.timestamp,
    );
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<IngestJobData> | undefined, error: Error) {
    if (!job) {
      return;
    }

    if (job.attemptsMade < (job.opts.attempts ?? 1)) {
      this.platformStats.recordIngestRetried(job.data.type);
      return;
    }

    await this.queueService.moveToDeadLetter(job, error);
    this.platformStats.recordIngestDeadLettered(
      job.data.type,
      job.data.items.length,
    );
    this.logger.error(
      `Ingest job ${job.id} (${job.data.type}) moved to the dead-letter queue after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }
}
