import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ListTracesQueryDto } from './dto/list-traces-query.dto.js';
import { TracesService } from './traces.service.js';

@Controller('projects/:projectId/traces')
export class TracesController {
  constructor(
    private readonly tracesService: TracesService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  async findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ListTracesQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.tracesService.findAll(projectId, query);
  }

  @Get(':traceId')
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('traceId') traceId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.tracesService.findOne(projectId, traceId);
  }
}
