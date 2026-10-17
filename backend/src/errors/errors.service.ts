import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  EntityManager,
  FindOptionsWhere,
  In,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';
import {
  redactAttributes,
  redactOptional,
  redactString,
} from '../common/redaction.js';
import { CreateErrorEventDto } from './dto/create-error-event.dto.js';
import { ListErrorEventsQueryDto } from './dto/list-error-events-query.dto.js';
import { ListErrorGroupsQueryDto } from './dto/list-error-groups-query.dto.js';
import { UpdateErrorGroupDto } from './dto/update-error-group.dto.js';
import { ErrorEvent } from './entities/error-event.entity.js';
import { ErrorGroup, ErrorStatus } from './entities/error-group.entity.js';
import { computeFingerprint } from './fingerprint.js';
import { ProjectEventType } from '../realtime/project-event.js';
import { RealtimeService } from '../realtime/realtime.service.js';

interface PreparedEvent {
  dto: CreateErrorEventDto;
  timestamp: Date;
}

@Injectable()
export class ErrorsService {
  constructor(
    @InjectRepository(ErrorGroup)
    private readonly groupsRepository: Repository<ErrorGroup>,
    @InjectRepository(ErrorEvent)
    private readonly eventsRepository: Repository<ErrorEvent>,
    private readonly dataSource: DataSource,
    private readonly realtimeService: RealtimeService,
  ) {}

  async ingest(projectId: string, dtos: CreateErrorEventDto[]): Promise<void> {
    const receivedAt = new Date();
    const batches = new Map<string, PreparedEvent[]>();

    for (const raw of dtos) {
      const dto = {
        ...raw,
        message: redactString(raw.message),
        stackTrace: redactOptional(raw.stackTrace),
        endpoint: redactOptional(raw.endpoint),
        attributes: redactAttributes(raw.attributes),
      };
      const fingerprint = computeFingerprint(dto);
      const timestamp = dto.timestamp ? new Date(dto.timestamp) : receivedAt;
      const batch = batches.get(fingerprint) ?? [];

      batch.push({ dto, timestamp });
      batches.set(fingerprint, batch);
    }

    const fingerprints = [...batches.keys()].sort();
    const groupIds: string[] = [];

    await this.dataSource.transaction(async (manager) => {
      for (const fingerprint of fingerprints) {
        const events = batches.get(fingerprint) ?? [];
        const group = await this.upsertGroup(
          manager,
          projectId,
          fingerprint,
          events,
        );
        groupIds.push(group.id);

        await manager.save(
          events.map(({ dto, timestamp }) =>
            manager.create(ErrorEvent, {
              ...dto,
              projectId,
              groupId: group.id,
              timestamp,
            }),
          ),
        );
      }
    });

    this.realtimeService.publish(projectId, ProjectEventType.ERRORS_INGESTED, {
      count: dtos.length,
      groupIds,
    });
  }

  findAll(
    projectId: string,
    query: ListErrorGroupsQueryDto,
  ): Promise<ErrorGroup[]> {
    const where: FindOptionsWhere<ErrorGroup> = { projectId };

    if (query.status) where.status = query.status;
    if (query.service) where.service = query.service;

    return this.groupsRepository.find({
      where,
      order: { lastSeen: 'DESC' },
      take: query.limit,
    });
  }

  async findOne(projectId: string, id: string): Promise<ErrorGroup> {
    const group = await this.groupsRepository.findOneBy({ id, projectId });

    if (!group) {
      throw new NotFoundException(`Error group ${id} not found`);
    }

    return group;
  }

  findByIds(projectId: string, ids: string[]): Promise<ErrorGroup[]> {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }

    return this.groupsRepository.findBy({ projectId, id: In(ids) });
  }

  findFirstSeenBetween(
    projectId: string,
    from: Date,
    to: Date,
  ): Promise<ErrorGroup[]> {
    return this.groupsRepository.find({
      where: { projectId, firstSeen: Between(from, to) },
      order: { firstSeen: 'ASC' },
      take: 20,
    });
  }

  async findEvents(
    projectId: string,
    id: string,
    query: ListErrorEventsQueryDto,
  ): Promise<ErrorEvent[]> {
    const group = await this.findOne(projectId, id);

    return this.eventsRepository.find({
      where: { groupId: group.id },
      order: { timestamp: 'DESC' },
      take: query.limit,
    });
  }

  async update(
    projectId: string,
    id: string,
    dto: UpdateErrorGroupDto,
  ): Promise<ErrorGroup> {
    const group = await this.findOne(projectId, id);
    this.groupsRepository.merge(group, dto);
    return this.groupsRepository.save(group);
  }

  private async upsertGroup(
    manager: EntityManager,
    projectId: string,
    fingerprint: string,
    events: PreparedEvent[],
  ): Promise<ErrorGroup> {
    const [{ dto }] = events;
    const times = events.map(({ timestamp }) => timestamp.getTime());
    const firstSeen = new Date(Math.min(...times));
    const lastSeen = new Date(Math.max(...times));

    await manager
      .createQueryBuilder()
      .insert()
      .into(ErrorGroup)
      .values({
        projectId,
        fingerprint,
        type: dto.type,
        message: dto.message,
        service: dto.service,
        endpoint: dto.endpoint ?? null,
        firstSeen,
        lastSeen,
      })
      .orIgnore()
      .execute();

    const group = await manager.findOneByOrFail(ErrorGroup, {
      projectId,
      fingerprint,
    });

    await manager.increment(
      ErrorGroup,
      { id: group.id },
      'occurrences',
      events.length,
    );
    await manager.update(
      ErrorGroup,
      { id: group.id, lastSeen: LessThan(lastSeen) },
      { lastSeen },
    );
    await manager.update(
      ErrorGroup,
      { id: group.id, firstSeen: MoreThan(firstSeen) },
      { firstSeen },
    );
    await manager.update(
      ErrorGroup,
      { id: group.id, status: ErrorStatus.RESOLVED },
      { status: ErrorStatus.OPEN },
    );

    return group;
  }
}
