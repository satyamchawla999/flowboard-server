import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class RemoveProjectMemberInput {
  @Field(() => ID)
  @IsUUID()
  projectId!: string;

  @Field(() => ID)
  @IsUUID()
  userId!: string;
}
