import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class CreateProjectSectionInput {
  @Field(() => ID)
  @IsUUID()
  projectId!: string;

  @Field()
  @IsString()
  @MaxLength(100)
  name!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  beforeSectionId?: string | null;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  afterSectionId?: string | null;
}
