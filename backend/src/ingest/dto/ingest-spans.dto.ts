import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateSpanDto } from '../../traces/dto/create-span.dto.js';

export class IngestSpansDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => CreateSpanDto)
  spans: CreateSpanDto[];
}
