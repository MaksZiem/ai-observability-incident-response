import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateIncidentNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  body: string;
}
