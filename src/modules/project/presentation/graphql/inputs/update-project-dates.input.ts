import { Field, ID, InputType } from '@nestjs/graphql';
import { IsDate, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class UpdateProjectDatesInput {
  @Field(() => ID)
  @IsUUID()
  projectId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  dueDate?: Date | null;
}
