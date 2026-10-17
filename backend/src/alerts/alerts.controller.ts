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
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { ProjectsService } from '../projects/projects.service.js';
import { AlertEvaluatorService } from './alert-evaluator.service.js';
import { AlertsService } from './alerts.service.js';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto.js';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto.js';

@Controller('projects/:projectId/alerts')
export class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly evaluatorService: AlertEvaluatorService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateAlertRuleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.alertsService.create(projectId, user.sub, dto);
  }

  @Get()
  async findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.alertsService.findAll(projectId);
  }

  @Get(':id')
  async findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.alertsService.findOne(projectId, id);
  }

  @Patch(':id')
  async update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAlertRuleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.alertsService.update(projectId, id, dto);
  }

  @Post(':id/evaluate')
  @HttpCode(HttpStatus.OK)
  async evaluate(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    const rule = await this.alertsService.findOne(projectId, id);
    return this.evaluatorService.evaluate(rule);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.projectsService.findOne(projectId, user.sub);
    return this.alertsService.remove(projectId, id);
  }
}
