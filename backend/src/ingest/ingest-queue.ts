import type { JobsOptions } from 'bullmq';
import type { CreateErrorEventDto } from '../errors/dto/create-error-event.dto.js';
import type { CreateLogDto } from '../logs/dto/create-log.dto.js';
import type { CreateSpanDto } from '../traces/dto/create-span.dto.js';

export const INGEST_QUEUE = 'ingest';
export const DEAD_LETTER_QUEUE = 'ingest-dead-letter';

export const INGEST_WORKER_CONCURRENCY = 4;

export const INGEST_JOB_OPTIONS: JobsOptions = {
  attempts: 8,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: true,
  removeOnFail: true,
};

export type IngestJobData =
  | { type: 'logs'; projectId: string; items: CreateLogDto[] }
  | { type: 'spans'; projectId: string; items: CreateSpanDto[] }
  | { type: 'errors'; projectId: string; items: CreateErrorEventDto[] };

export type BatchType = IngestJobData['type'];

export interface DeadLetterJobData {
  job: IngestJobData;
  error: string;
  attempts: number;
  failedAt: string;
}

export function withReceivedAt<T extends { timestamp?: string }>(
  items: T[],
  receivedAt: Date,
): T[] {
  const fallback = receivedAt.toISOString();

  return items.map((item) => ({
    ...item,
    timestamp: item.timestamp ?? fallback,
  }));
}
