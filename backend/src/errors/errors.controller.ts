import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ListErrorEventsQueryDto } from './dto/list-error-events-query.dto.js';
import { ListErrorGroupsQueryDto } from './dto/list-error-groups-query.dto.js';
import { UpdateErrorGroupDto } from './dto/update-error-group.dto.js';
import { ErrorsService } from './errors.service.js';

@Controller('projects/:projectId/errors')
export class ErrorsController {
  constructor(
    private readonly errorsService: ErrorsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  async findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ListErrorGroupsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.errorsService.findAll(projectId, query);
  }

  @Get(':id')
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.errorsService.findOne(projectId, id);
  }

  @Get(':id/events')
  async findEvents(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListErrorEventsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.errorsService.findEvents(projectId, id, query);
  }

  @Patch(':id')
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateErrorGroupDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.errorsService.update(projectId, id, dto);
  }
}
