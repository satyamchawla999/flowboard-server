import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

/**
 * Application-layer DTO for updating workspace details.
 */
export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  logo?: string | null;

  @IsOptional()
  @IsString()
  timezone?: string;
}
