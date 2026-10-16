import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ErrorStatus } from '../entities/error-group.entity.js';

export class ListErrorGroupsQueryDto {
  @IsOptional()
  @IsEnum(ErrorStatus)
  status?: ErrorStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  service?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;
}
