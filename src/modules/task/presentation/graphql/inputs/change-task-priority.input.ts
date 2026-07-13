import { Field, ID, InputType } from '@nestjs/graphql';
import { TaskPriorityLevel } from '../../../domain/value-objects/task-priority.vo';

@InputType()
export class ChangeTaskPriorityInput {
  @Field(() => ID)
  taskId!: string;

  @Field(() => TaskPriorityLevel)
  priority!: TaskPriorityLevel;
}
