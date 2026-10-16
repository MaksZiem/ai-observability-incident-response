import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IncidentSeverity } from '../entities/incident.entity.js';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;

  @IsOptional()
  @IsISO8601({ strict: true })
  startedAt?: string;
}
