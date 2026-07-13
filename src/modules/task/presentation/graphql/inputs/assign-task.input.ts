import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class AssignTaskInput {
  @Field(() => ID)
  taskId!: string;

  @Field(() => ID)
  assigneeUserId!: string;
}
