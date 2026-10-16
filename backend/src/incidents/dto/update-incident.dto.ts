import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { IncidentStatus } from '../entities/incident.entity.js';
import { CreateIncidentDto } from './create-incident.dto.js';

export class UpdateIncidentDto extends PartialType(CreateIncidentDto) {
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}
