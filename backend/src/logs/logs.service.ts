import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  Equal,
  FindOperator,
  FindOptionsWhere,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateLogDto } from './dto/create-log.dto.js';
import { ListLogsQueryDto } from './dto/list-logs-query.dto.js';
import { ProjectEventType } from '../realtime/project-event.js';
import { RealtimeService } from '../realtime/realtime.service.js';
import { Log } from './entities/log.entity.js';
import { decodeLogCursor, encodeLogCursor, LogCursor } from './log-cursor.js';

export interface LogPage {
  items: Log[];
  nextCursor: string | null;
}

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log) private readonly logsRepository: Repository<Log>,
    private readonly realtimeService: RealtimeService,
  ) {}

  async createMany(projectId: string, dtos: CreateLogDto[]): Promise<void> {
    const receivedAt = new Date();

    const logs = dtos.map((dto) =>
      this.logsRepository.create({
        ...dto,
        projectId,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : receivedAt,
      }),
    );

    await this.logsRepository.save(logs);

    this.realtimeService.publish(projectId, ProjectEventType.LOGS_INGESTED, {
      count: logs.length,
    });
  }

  async findAll(projectId: string, query: ListLogsQueryDto): Promise<LogPage> {
    const cursor = query.cursor ? decodeLogCursor(query.cursor) : null;

    if (query.cursor && !cursor) {
      throw new BadRequestException('Invalid cursor');
    }

    const logs = await this.logsRepository.find({
      where: this.buildWhere(projectId, query, cursor),
      order: { timestamp: 'DESC', id: 'DESC' },
      take: query.limit + 1,
    });

    const hasMore = logs.length > query.limit;
    const items = hasMore ? logs.slice(0, query.limit) : logs;

    return {
      items,
      nextCursor: hasMore ? encodeLogCursor(items[items.length - 1]) : null,
    };
  }

  async findOne(projectId: string, id: string): Promise<Log> {
    const log = await this.logsRepository.findOneBy({ id, projectId });

    if (!log) {
      throw new NotFoundException(`Log ${id} not found`);
    }

    return log;
  }

  findByIds(projectId: string, ids: string[]): Promise<Log[]> {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }

    return this.logsRepository.find({
      where: { projectId, id: In(ids) },
      order: { timestamp: 'ASC' },
    });
  }

  private buildWhere(
    projectId: string,
    query: ListLogsQueryDto,
    cursor: LogCursor | null,
  ): FindOptionsWhere<Log>[] {
    const filters: FindOptionsWhere<Log> = { projectId };

    if (query.service) filters.service = query.service;
    if (query.level) filters.level = In(query.level);
    if (query.endpoint) filters.endpoint = query.endpoint;
    if (query.traceId) filters.traceId = query.traceId;
    if (query.requestId) filters.requestId = query.requestId;

    const range: FindOperator<Date>[] = [];

    if (query.from) range.push(MoreThanOrEqual(new Date(query.from)));
    if (query.to) range.push(LessThanOrEqual(new Date(query.to)));

    if (!cursor) {
      return [
        range.length > 0 ? { ...filters, timestamp: And(...range) } : filters,
      ];
    }

    return [
      { ...filters, timestamp: And(...range, LessThan(cursor.timestamp)) },
      {
        ...filters,
        timestamp: And(...range, Equal(cursor.timestamp)),
        id: LessThan(cursor.id),
      },
    ];
  }
}
