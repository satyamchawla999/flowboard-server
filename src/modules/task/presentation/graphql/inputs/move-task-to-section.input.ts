import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class MoveTaskToSectionInput {
  @Field(() => ID)
  taskId!: string;

  @Field(() => ID)
  targetSectionId!: string;

  @Field(() => ID, { nullable: true })
  beforeTaskId?: string;

  @Field(() => ID, { nullable: true })
  afterTaskId?: string;
}
