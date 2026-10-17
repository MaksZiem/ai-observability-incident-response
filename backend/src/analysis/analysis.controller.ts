import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ProjectsService } from '../projects/projects.service.js';
import { AnalysisService } from './analysis.service.js';

@Controller('projects/:projectId/incidents/:incidentId/analyses')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async request(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.analysisService.request(projectId, incidentId, user.sub);
  }

  @Get()
  async findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.analysisService.findAll(projectId, incidentId);
  }

  @Get(':id')
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.analysisService.findOne(projectId, incidentId, id);
  }
}
