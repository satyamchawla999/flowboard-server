import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { TaskView } from '../../../domain/value-objects/workspace-preferences.vo';

@InputType()
export class UpdatePreferencesInput {
  @Field(() => TaskView, { nullable: true })
  @IsOptional()
  @IsEnum(TaskView)
  defaultTaskView?: TaskView;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  defaultTimezone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notificationSettings?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  automationRules?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  customStatuses?: string;
}
