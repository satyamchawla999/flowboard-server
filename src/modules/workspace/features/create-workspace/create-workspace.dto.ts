import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @IsUUID()
  ownerId!: string;

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
