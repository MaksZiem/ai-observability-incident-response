import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ProjectsService } from '../projects/projects.service.js';
import { MetricsQueryDto } from './dto/metrics-query.dto.js';
import { MetricsService } from './metrics.service.js';

@Controller('projects/:projectId/metrics')
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get('overview')
  async getOverview(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: MetricsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.metricsService.getOverview(projectId, query);
  }

  @Get('services')
  async getServices(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: MetricsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.metricsService.getServices(projectId, query);
  }
}
