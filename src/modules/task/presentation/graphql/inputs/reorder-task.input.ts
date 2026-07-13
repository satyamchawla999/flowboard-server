import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class ReorderTaskInput {
  @Field(() => ID)
  taskId!: string;

  @Field(() => ID, { nullable: true })
  beforeTaskId?: string;

  @Field(() => ID, { nullable: true })
  afterTaskId?: string;
}
