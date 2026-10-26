import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator.js';
import { DeploymentsService } from '../deployments/deployments.service.js';
import { CreateDeploymentDto } from '../deployments/dto/create-deployment.dto.js';
import { IngestExceptionFilter } from '../platform/ingest-exception.filter.js';
import { IngestStatsInterceptor } from '../platform/ingest-stats.interceptor.js';
import type { Project } from '../projects/entities/project.entity.js';
import { CurrentProject } from './decorators/current-project.decorator.js';
import { IngestErrorsDto } from './dto/ingest-errors.dto.js';
import { IngestLogsDto } from './dto/ingest-logs.dto.js';
import { IngestSpansDto } from './dto/ingest-spans.dto.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';
import { withReceivedAt } from './ingest-queue.js';
import { IngestQueueService } from './ingest-queue.service.js';

@Public()
@Throttle({ default: { limit: 1200, ttl: 60_000 } })
@UseGuards(ApiKeyGuard)
@UseInterceptors(IngestStatsInterceptor)
@UseFilters(IngestExceptionFilter)
@Controller('ingest')
export class IngestController {
  constructor(
    private readonly queueService: IngestQueueService,
    private readonly deploymentsService: DeploymentsService,
  ) {}

  @Post('logs')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestLogs(
    @Body() dto: IngestLogsDto,
    @CurrentProject() project: Project,
  ) {
    await this.queueService.enqueue({
      type: 'logs',
      projectId: project.id,
      items: withReceivedAt(dto.logs, new Date()),
    });
    return { accepted: dto.logs.length };
  }

  @Post('spans')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestSpans(
    @Body() dto: IngestSpansDto,
    @CurrentProject() project: Project,
  ) {
    await this.queueService.enqueue({
      type: 'spans',
      projectId: project.id,
      items: dto.spans,
    });
    return { accepted: dto.spans.length };
  }

  @Post('errors')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestErrors(
    @Body() dto: IngestErrorsDto,
    @CurrentProject() project: Project,
  ) {
    await this.queueService.enqueue({
      type: 'errors',
      projectId: project.id,
      items: withReceivedAt(dto.errors, new Date()),
    });
    return { accepted: dto.errors.length };
  }

  @Post('deployments')
  ingestDeployment(
    @Body() dto: CreateDeploymentDto,
    @CurrentProject() project: Project,
  ) {
    return this.deploymentsService.create(project.id, dto);
  }
}
