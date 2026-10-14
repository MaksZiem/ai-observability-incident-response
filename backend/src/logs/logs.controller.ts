import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ListLogsQueryDto } from './dto/list-logs-query.dto.js';
import { LogsService } from './logs.service.js';

@Controller('projects/:projectId/logs')
export class LogsController {
  constructor(
    private readonly logsService: LogsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  async findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ListLogsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.logsService.findAll(projectId, query);
  }

  @Get(':id')
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.logsService.findOne(projectId, id);
  }
}
