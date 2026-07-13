import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class ListWorkspaceProjectsInput {
  @Field(() => ID)
  @IsUUID()
  workspaceId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
