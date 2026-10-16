import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IncidentLinkKind } from '../entities/incident-link.entity.js';

export class CreateIncidentLinkDto {
  @IsEnum(IncidentLinkKind)
  kind: IncidentLinkKind;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  targetId: string;
}
