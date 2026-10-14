import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateLogDto } from '../../logs/dto/create-log.dto.js';

export class IngestLogsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => CreateLogDto)
  logs: CreateLogDto[];
}
