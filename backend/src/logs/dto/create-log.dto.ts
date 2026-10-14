import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LogLevel } from '../entities/log.entity.js';

export class CreateLogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  service: string;

  @IsEnum(LogLevel)
  level: LogLevel;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  message: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  timestamp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  traceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  spanId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  requestId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  endpoint?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}
