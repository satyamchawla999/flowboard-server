import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateTaskDetailsInput {
  @Field(() => ID)
  taskId!: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;
}
