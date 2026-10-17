import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IncidentSeverity } from '../../incidents/entities/incident.entity.js';
import { AlertComparator, AlertMetric } from '../entities/alert-rule.entity.js';

export class CreateAlertRuleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEnum(AlertMetric)
  metric: AlertMetric;

  @IsEnum(AlertComparator)
  comparator: AlertComparator;

  @IsNumber()
  @Min(0)
  threshold: number;

  @IsInt()
  @Min(1)
  @Max(1440)
  windowMinutes: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  service?: string;

  @IsOptional()
  @IsBoolean()
  createIncident?: boolean;

  @IsOptional()
  @IsEnum(IncidentSeverity)
  incidentSeverity?: IncidentSeverity;

  @IsOptional()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(2048)
  webhookUrl?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
