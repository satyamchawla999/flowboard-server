import { Field, ID, InputType } from '@nestjs/graphql';
import { TaskLifecycleStatusValue } from '../../../domain/value-objects/task-lifecycle-status.vo';

@InputType()
export class ListMyAssignedTasksInput {
  @Field(() => ID, { nullable: true })
  workspaceId?: string;

  @Field(() => TaskLifecycleStatusValue, { nullable: true })
  lifecycleStatus?: TaskLifecycleStatusValue;
}
