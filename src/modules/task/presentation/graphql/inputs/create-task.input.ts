import { Field, ID, InputType } from '@nestjs/graphql';
import { TaskPriorityLevel } from '../../../domain/value-objects/task-priority.vo';

@InputType()
export class CreateTaskInput {
  @Field(() => ID)
  projectId!: string;

  @Field(() => ID, { nullable: true })
  sectionId?: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID, { nullable: true })
  assigneeUserId?: string;

  @Field(() => TaskPriorityLevel, { nullable: true })
  priority?: TaskPriorityLevel;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => ID, { nullable: true })
  beforeTaskId?: string;

  @Field(() => ID, { nullable: true })
  afterTaskId?: string;
}
