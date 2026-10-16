import {
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateErrorEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  service: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  stackTrace?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  timestamp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  endpoint?: string;

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
  @IsObject()
  attributes?: Record<string, unknown>;
}
