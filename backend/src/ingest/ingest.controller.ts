import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator.js';
import { LogsService } from '../logs/logs.service.js';
import type { Project } from '../projects/entities/project.entity.js';
import { CurrentProject } from './decorators/current-project.decorator.js';
import { IngestLogsDto } from './dto/ingest-logs.dto.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';

@Public()
@UseGuards(ApiKeyGuard)
@Controller('ingest')
export class IngestController {
  constructor(private readonly logsService: LogsService) {}

  @Post('logs')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestLogs(
    @Body() dto: IngestLogsDto,
    @CurrentProject() project: Project,
  ) {
    await this.logsService.createMany(project.id, dto.logs);
    return { accepted: dto.logs.length };
  }
}
