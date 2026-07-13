import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class SetTaskDueDateInput {
  @Field(() => ID)
  taskId!: string;

  @Field({ nullable: true })
  dueDate?: Date;
}
