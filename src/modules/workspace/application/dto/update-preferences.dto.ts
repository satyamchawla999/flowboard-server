import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { TaskView } from '../../domain/value-objects/workspace-preferences.vo';

/**
 * Application-layer DTO for updating workspace preferences.
 */
export class UpdatePreferencesDto {
  @IsOptional()
  @IsEnum(TaskView)
  defaultTaskView?: TaskView;

  @IsOptional()
  @IsString()
  defaultTimezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notificationSettings?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  automationRules?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  customStatuses?: string | null;
}
