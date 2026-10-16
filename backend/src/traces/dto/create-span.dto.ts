import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SpanKind, SpanStatus } from '../entities/span.entity.js';

export class CreateSpanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  traceId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  spanId: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  parentSpanId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  service: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsEnum(SpanKind)
  kind?: SpanKind;

  @IsOptional()
  @IsEnum(SpanStatus)
  status?: SpanStatus;

  @IsISO8601({ strict: true })
  startTime: string;

  @IsNumber()
  @Min(0)
  @Max(86_400_000)
  durationMs: number;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}
