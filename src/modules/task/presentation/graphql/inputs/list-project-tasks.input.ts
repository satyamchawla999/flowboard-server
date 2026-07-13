import { Field, ID, InputType } from '@nestjs/graphql';
import { TaskLifecycleStatusValue } from '../../../domain/value-objects/task-lifecycle-status.vo';
import { TaskPriorityLevel } from '../../../domain/value-objects/task-priority.vo';

@InputType()
export class ListProjectTasksInput {
  @Field(() => ID)
  projectId!: string;

  @Field(() => ID, { nullable: true })
  sectionId?: string;

  @Field(() => ID, { nullable: true })
  assigneeUserId?: string;

  @Field(() => TaskLifecycleStatusValue, { nullable: true })
  lifecycleStatus?: TaskLifecycleStatusValue;

  @Field(() => TaskPriorityLevel, { nullable: true })
  priority?: TaskPriorityLevel;

  @Field({ nullable: true })
  dueDateFrom?: Date;

  @Field({ nullable: true })
  dueDateTo?: Date;
}
