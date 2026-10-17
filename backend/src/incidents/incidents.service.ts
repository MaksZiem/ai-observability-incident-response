import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { DeploymentsService } from '../deployments/deployments.service.js';
import { ErrorsService } from '../errors/errors.service.js';
import { LogsService } from '../logs/logs.service.js';
import { Project } from '../projects/entities/project.entity.js';
import { ProjectEventType } from '../realtime/project-event.js';
import { RealtimeService } from '../realtime/realtime.service.js';
import { TracesService } from '../traces/traces.service.js';
import { CreateIncidentLinkDto } from './dto/create-incident-link.dto.js';
import { CreateIncidentNoteDto } from './dto/create-incident-note.dto.js';
import { CreateIncidentDto } from './dto/create-incident.dto.js';
import { ListIncidentsQueryDto } from './dto/list-incidents-query.dto.js';
import { UpdateIncidentDto } from './dto/update-incident.dto.js';
import {
  IncidentLink,
  IncidentLinkKind,
} from './entities/incident-link.entity.js';
import { IncidentNote } from './entities/incident-note.entity.js';
import { Incident } from './entities/incident.entity.js';
import { applyStatus } from './incident-status.js';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentsRepository: Repository<Incident>,
    @InjectRepository(IncidentNote)
    private readonly notesRepository: Repository<IncidentNote>,
    @InjectRepository(IncidentLink)
    private readonly linksRepository: Repository<IncidentLink>,
    private readonly dataSource: DataSource,
    private readonly errorsService: ErrorsService,
    private readonly tracesService: TracesService,
    private readonly deploymentsService: DeploymentsService,
    private readonly logsService: LogsService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async create(
    projectId: string,
    userId: string,
    dto: CreateIncidentDto,
  ): Promise<Incident> {
    const incident = await this.dataSource.transaction(async (manager) => {
      await manager.increment(
        Project,
        { id: projectId },
        'lastIncidentNumber',
        1,
      );

      const { lastIncidentNumber } = await manager.findOneOrFail(Project, {
        where: { id: projectId },
        select: { id: true, lastIncidentNumber: true },
      });

      return manager.save(
        manager.create(Incident, {
          ...dto,
          projectId,
          number: lastIncidentNumber,
          createdById: userId,
          startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
        }),
      );
    });

    this.notifyChanged(incident);
    return incident;
  }

  findAll(
    projectId: string,
    query: ListIncidentsQueryDto,
  ): Promise<Incident[]> {
    const where: FindOptionsWhere<Incident> = { projectId };

    if (query.status) where.status = query.status;
    if (query.severity) where.severity = query.severity;

    return this.incidentsRepository.find({
      where,
      order: { startedAt: 'DESC' },
      take: query.limit,
    });
  }

  async findOne(projectId: string, id: string): Promise<Incident> {
    const incident = await this.incidentsRepository.findOneBy({
      id,
      projectId,
    });

    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found`);
    }

    return incident;
  }

  async update(
    projectId: string,
    id: string,
    dto: UpdateIncidentDto,
  ): Promise<Incident> {
    const incident = await this.findOne(projectId, id);
    const { status, startedAt, ...fields } = dto;

    this.incidentsRepository.merge(incident, fields);

    if (startedAt) {
      incident.startedAt = new Date(startedAt);
    }

    if (status) {
      applyStatus(incident, status, new Date());
    }

    const saved = await this.incidentsRepository.save(incident);
    this.notifyChanged(saved);
    return saved;
  }

  async findNotes(projectId: string, id: string): Promise<IncidentNote[]> {
    const incident = await this.findOne(projectId, id);

    return this.notesRepository.find({
      where: { incidentId: incident.id },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });
  }

  async addNote(
    projectId: string,
    id: string,
    userId: string,
    dto: CreateIncidentNoteDto,
  ): Promise<IncidentNote> {
    const incident = await this.findOne(projectId, id);

    const note = await this.notesRepository.save(
      this.notesRepository.create({
        ...dto,
        incidentId: incident.id,
        authorId: userId,
      }),
    );

    this.notifyChanged(incident);
    return note;
  }

  async findLinks(projectId: string, id: string): Promise<IncidentLink[]> {
    const incident = await this.findOne(projectId, id);

    return this.linksRepository.find({
      where: { incidentId: incident.id },
      order: { createdAt: 'ASC' },
    });
  }

  async addLink(
    projectId: string,
    id: string,
    dto: CreateIncidentLinkDto,
  ): Promise<IncidentLink> {
    const incident = await this.findOne(projectId, id);
    await this.assertTargetExists(projectId, dto);

    const existing = await this.linksRepository.findOneBy({
      incidentId: incident.id,
      kind: dto.kind,
      targetId: dto.targetId,
    });

    if (existing) {
      throw new ConflictException('Already linked to this incident');
    }

    return this.linksRepository.save(
      this.linksRepository.create({ ...dto, incidentId: incident.id }),
    );
  }

  async removeLink(
    projectId: string,
    id: string,
    linkId: string,
  ): Promise<void> {
    const incident = await this.findOne(projectId, id);
    const link = await this.linksRepository.findOneBy({
      id: linkId,
      incidentId: incident.id,
    });

    if (!link) {
      throw new NotFoundException(`Link ${linkId} not found`);
    }

    await this.linksRepository.remove(link);
  }

  private notifyChanged(incident: Incident): void {
    this.realtimeService.publish(
      incident.projectId,
      ProjectEventType.INCIDENT_CHANGED,
      { incidentId: incident.id, status: incident.status },
    );
  }

  private async assertTargetExists(
    projectId: string,
    { kind, targetId }: CreateIncidentLinkDto,
  ): Promise<void> {
    if (kind !== IncidentLinkKind.TRACE && !isUUID(targetId)) {
      throw new BadRequestException('targetId must be a UUID');
    }

    switch (kind) {
      case IncidentLinkKind.ERROR_GROUP:
        await this.errorsService.findOne(projectId, targetId);
        return;
      case IncidentLinkKind.TRACE:
        await this.tracesService.findOne(projectId, targetId);
        return;
      case IncidentLinkKind.DEPLOYMENT:
        await this.deploymentsService.findOne(projectId, targetId);
        return;
      case IncidentLinkKind.LOG:
        await this.logsService.findOne(projectId, targetId);
        return;
    }
  }
}
