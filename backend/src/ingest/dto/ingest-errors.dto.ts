import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { CreateErrorEventDto } from '../../errors/dto/create-error-event.dto.js';

export class IngestErrorsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => CreateErrorEventDto)
  errors: CreateErrorEventDto[];
}
