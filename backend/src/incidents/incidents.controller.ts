import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ProjectsService } from '../projects/projects.service.js';
import { CreateIncidentLinkDto } from './dto/create-incident-link.dto.js';
import { CreateIncidentNoteDto } from './dto/create-incident-note.dto.js';
import { CreateIncidentDto } from './dto/create-incident.dto.js';
import { ListIncidentsQueryDto } from './dto/list-incidents-query.dto.js';
import { UpdateIncidentDto } from './dto/update-incident.dto.js';
import { IncidentsService } from './incidents.service.js';

@Controller('projects/:projectId/incidents')
export class IncidentsController {
  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateIncidentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.create(projectId, user.sub, dto);
  }

  @Get()
  async findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ListIncidentsQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.findAll(projectId, query);
  }

  @Get(':id')
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.findOne(projectId, id);
  }

  @Patch(':id')
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.update(projectId, id, dto);
  }

  @Get(':id/notes')
  async findNotes(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.findNotes(projectId, id);
  }

  @Post(':id/notes')
  async addNote(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateIncidentNoteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.addNote(projectId, id, user.sub, dto);
  }

  @Get(':id/links')
  async findLinks(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.findLinks(projectId, id);
  }

  @Post(':id/links')
  async addLink(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateIncidentLinkDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.addLink(projectId, id, dto);
  }

  @Delete(':id/links/:linkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeLink(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('linkId', ParseUUIDPipe) linkId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.incidentsService.removeLink(projectId, id, linkId);
  }
}
