import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Job, Queue } from 'bullmq';
import {
  PlatformStatsService,
  QueueDepth,
} from '../platform/platform-stats.service.js';
import {
  DEAD_LETTER_QUEUE,
  DeadLetterJobData,
  INGEST_JOB_OPTIONS,
  INGEST_QUEUE,
  IngestJobData,
} from './ingest-queue.js';

@Injectable()
export class IngestQueueService implements OnModuleInit {
  constructor(
    @InjectQueue(INGEST_QUEUE)
    private readonly ingestQueue: Queue<IngestJobData>,
    @InjectQueue(DEAD_LETTER_QUEUE)
    private readonly deadLetterQueue: Queue<DeadLetterJobData>,
    private readonly platformStats: PlatformStatsService,
  ) {}

  onModuleInit(): void {
    this.platformStats.setQueueDepthSource(() => this.depth());
  }

  async enqueue(data: IngestJobData): Promise<void> {
    await this.ingestQueue.add(data.type, data, INGEST_JOB_OPTIONS);
  }

  async moveToDeadLetter(job: Job<IngestJobData>, error: Error): Promise<void> {
    await this.deadLetterQueue.add(job.data.type, {
      job: job.data,
      error: error.message,
      attempts: job.attemptsMade,
      failedAt: new Date().toISOString(),
    });
  }

  async depth(): Promise<QueueDepth> {
    const [counts, deadLettered] = await Promise.all([
      this.ingestQueue.getJobCounts('waiting', 'active', 'delayed'),
      this.deadLetterQueue.getWaitingCount(),
    ]);

    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      delayed: counts.delayed ?? 0,
      deadLettered,
    };
  }

  async isIdle(): Promise<boolean> {
    const { waiting, active, delayed } = await this.depth();
    return waiting + active + delayed === 0;
  }
}
