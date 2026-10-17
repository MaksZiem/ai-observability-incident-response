import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  FindOperator,
  FindOptionsWhere,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { redactAttributes, redactString } from '../common/redaction.js';
import { CreateSpanDto } from './dto/create-span.dto.js';
import { ListTracesQueryDto } from './dto/list-traces-query.dto.js';
import { ProjectEventType } from '../realtime/project-event.js';
import { RealtimeService } from '../realtime/realtime.service.js';
import { Span, SpanKind } from './entities/span.entity.js';
import { buildTraceDetail, TraceDetail } from './trace-detail.js';

@Injectable()
export class TracesService {
  constructor(
    @InjectRepository(Span) private readonly spansRepository: Repository<Span>,
    private readonly realtimeService: RealtimeService,
  ) {}

  async createMany(projectId: string, dtos: CreateSpanDto[]): Promise<void> {
    const spans = dtos.map((dto) =>
      this.spansRepository.create({
        ...dto,
        name: redactString(dto.name),
        attributes: redactAttributes(dto.attributes),
        projectId,
        kind:
          dto.kind ?? (dto.parentSpanId ? SpanKind.INTERNAL : SpanKind.SERVER),
        startTime: new Date(dto.startTime),
      }),
    );

    await this.spansRepository.save(spans);

    this.realtimeService.publish(projectId, ProjectEventType.SPANS_INGESTED, {
      count: spans.length,
    });
  }

  findAll(projectId: string, query: ListTracesQueryDto): Promise<Span[]> {
    const where: FindOptionsWhere<Span> = {
      projectId,
      parentSpanId: IsNull(),
    };

    if (query.service) where.service = query.service;
    if (query.status) where.status = query.status;
    if (query.minDurationMs !== undefined) {
      where.durationMs = MoreThanOrEqual(query.minDurationMs);
    }

    const range: FindOperator<Date>[] = [];

    if (query.from) range.push(MoreThanOrEqual(new Date(query.from)));
    if (query.to) range.push(LessThanOrEqual(new Date(query.to)));
    if (range.length > 0) where.startTime = And(...range);

    return this.spansRepository.find({
      where,
      order: { startTime: 'DESC' },
      take: query.limit,
    });
  }

  async findOne(projectId: string, traceId: string): Promise<TraceDetail> {
    const spans = await this.spansRepository.find({
      where: { projectId, traceId },
      order: { startTime: 'ASC' },
    });

    if (spans.length === 0) {
      throw new NotFoundException(`Trace ${traceId} not found`);
    }

    return buildTraceDetail(traceId, spans);
  }

  async findByTraceIds(
    projectId: string,
    traceIds: string[],
  ): Promise<TraceDetail[]> {
    if (traceIds.length === 0) {
      return [];
    }

    const spans = await this.spansRepository.find({
      where: { projectId, traceId: In(traceIds) },
      order: { startTime: 'ASC' },
    });

    return traceIds
      .map((traceId) => spans.filter((span) => span.traceId === traceId))
      .filter((traceSpans) => traceSpans.length > 0)
      .map((traceSpans) => buildTraceDetail(traceSpans[0].traceId, traceSpans));
  }
}
