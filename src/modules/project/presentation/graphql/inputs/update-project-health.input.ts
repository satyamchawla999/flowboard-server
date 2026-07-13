import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ProjectHealthStatus } from '../../../domain/value-objects/project-health-status.vo';

@InputType()
export class UpdateProjectHealthInput {
  @Field(() => ID)
  @IsUUID()
  projectId!: string;

  @Field(() => ProjectHealthStatus)
  @IsEnum(ProjectHealthStatus)
  healthStatus!: ProjectHealthStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  statusMessage?: string | null;
}
