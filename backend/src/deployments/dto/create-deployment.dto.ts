import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDeploymentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  version: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  service?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  commitSha?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  deployedAt?: string;
}
