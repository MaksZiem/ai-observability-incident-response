import { IsEnum } from 'class-validator';
import { ErrorStatus } from '../entities/error-group.entity.js';

export class UpdateErrorGroupDto {
  @IsEnum(ErrorStatus)
  status: ErrorStatus;
}
