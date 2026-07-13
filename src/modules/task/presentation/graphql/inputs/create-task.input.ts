import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsUUID, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { TaskPriorityLevel } from '../../../domain/value-objects/task-priority.vo';

@InputType()
export class CreateTaskInput {
  @Field()
  @IsString()
  @MaxLength(500)
  title!: string;

  @Field(() => ID)
  @IsUUID()
  projectId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @Field(() => TaskPriorityLevel, { nullable: true })
  @IsOptional()
  @IsEnum(TaskPriorityLevel)
  priority?: TaskPriorityLevel;
}
