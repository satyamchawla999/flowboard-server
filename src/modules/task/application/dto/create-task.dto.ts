import { IsString, IsUUID, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { TaskPriorityLevel } from '../../domain/value-objects/task-priority.vo';

/**
 * Application-layer DTO — validated input that the service accepts.
 *
 * Why separate from GraphQL Input: GraphQL inputs carry decorators specific
 * to the presentation layer. Application services should accept plain,
 * framework-agnostic DTOs. This keeps the application layer testable
 * without spinning up GraphQL.
 */
export class CreateTaskDto {
  @IsString()
  @MaxLength(500)
  title!: string;

  @IsUUID()
  projectId!: string;

  @IsUUID()
  createdById!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriorityLevel)
  priority?: TaskPriorityLevel;
}
