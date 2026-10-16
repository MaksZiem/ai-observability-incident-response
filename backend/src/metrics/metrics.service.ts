import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Span, SpanKind, SpanStatus } from '../traces/entities/span.entity.js';
import { MetricsQueryDto } from './dto/metrics-query.dto.js';
import {
  getServiceStatus,
  RawRequestStats,
  RequestStats,
  ServiceStatus,
  toRequestStats,
} from './request-stats.js';
import {
  bucketStarts,
  ResolvedTimeRange,
  resolveTimeRange,
} from './time-range.js';

export interface SeriesPoint extends RequestStats {
  bucket: Date;
}

export interface Overview {
  from: Date;
  to: Date;
  stepMs: number;
  summary: RequestStats;
  series: SeriesPoint[];
}

export interface ServiceHealth extends RequestStats {
  service: string;
  status: ServiceStatus;
}

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Span) private readonly spansRepository: Repository<Span>,
  ) {}

  async getOverview(
    projectId: string,
    query: MetricsQueryDto,
  ): Promise<Overview> {
    const range = resolveTimeRange(query.range);

    const summary = await this.requestsQuery(
      projectId,
      range,
      query.service,
    ).getRawOne<RawRequestStats>();

    return {
      from: range.from,
      to: range.to,
      stepMs: range.stepMs,
      summary: toRequestStats(summary),
      series: await this.getSeries(projectId, range, query.service),
    };
  }

  async getSeries(
    projectId: string,
    range: ResolvedTimeRange,
    service?: string,
  ): Promise<SeriesPoint[]> {
    const rows = await this.requestsQuery(projectId, range, service)
      .addSelect(
        'date_bin(CAST(:step AS interval), span.startTime, CAST(:origin AS timestamptz))',
        'bucket',
      )
      .setParameter('step', `${range.stepMs / 1000} seconds`)
      .setParameter('origin', range.from)
      .groupBy('bucket')
      .getRawMany<RawRequestStats & { bucket: Date }>();

    const byBucket = new Map(
      rows.map((row) => [new Date(row.bucket).getTime(), row]),
    );

    return bucketStarts(range).map((bucket) => ({
      bucket,
      ...toRequestStats(byBucket.get(bucket.getTime())),
    }));
  }

  async getServices(
    projectId: string,
    query: MetricsQueryDto,
  ): Promise<ServiceHealth[]> {
    const range = resolveTimeRange(query.range);

    const rows = await this.statsQuery(projectId, range)
      .addSelect('span.service', 'service')
      .andWhere('span.kind = :kind', { kind: SpanKind.SERVER })
      .groupBy('span.service')
      .orderBy('span.service')
      .getRawMany<RawRequestStats & { service: string }>();

    return rows.map((row) => {
      const stats = toRequestStats(row);
      return {
        service: row.service,
        ...stats,
        status: getServiceStatus(stats),
      };
    });
  }

  private requestsQuery(
    projectId: string,
    range: ResolvedTimeRange,
    service: string | undefined,
  ): SelectQueryBuilder<Span> {
    const query = this.statsQuery(projectId, range);

    return service
      ? query
          .andWhere('span.service = :service', { service })
          .andWhere('span.kind = :kind', { kind: SpanKind.SERVER })
      : query.andWhere('span.parentSpanId IS NULL');
  }

  private statsQuery(
    projectId: string,
    range: ResolvedTimeRange,
  ): SelectQueryBuilder<Span> {
    return this.spansRepository
      .createQueryBuilder('span')
      .select('COUNT(*)', 'requests')
      .addSelect('COUNT(*) FILTER (WHERE span.status = :errorStatus)', 'errors')
      .addSelect(
        'percentile_cont(0.95) WITHIN GROUP (ORDER BY span.durationMs)',
        'p95',
      )
      .where('span.projectId = :projectId', { projectId })
      .andWhere('span.startTime >= :from', { from: range.from })
      .andWhere('span.startTime < :to', { to: range.to })
      .setParameter('errorStatus', SpanStatus.ERROR);
  }
}
