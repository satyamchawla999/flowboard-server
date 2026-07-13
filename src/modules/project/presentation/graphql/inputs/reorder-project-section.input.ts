import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsUUID } from 'class-validator';

@InputType()
export class ReorderProjectSectionInput {
  @Field(() => ID)
  @IsUUID()
  sectionId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  beforeSectionId?: string | null;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  afterSectionId?: string | null;
}
