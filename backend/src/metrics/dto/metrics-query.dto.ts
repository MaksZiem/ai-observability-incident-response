import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TimeRange } from '../time-range.js';

export class MetricsQueryDto {
  @IsOptional()
  @IsEnum(TimeRange)
  range: TimeRange = TimeRange.ONE_HOUR;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  service?: string;
}
