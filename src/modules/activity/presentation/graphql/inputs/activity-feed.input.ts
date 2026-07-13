import { Field, ID, InputType } from '@nestjs/graphql';
import { ActivityType } from '../../../domain/value-objects/activity-type.vo';

@InputType()
export class WorkspaceActivityInput {
  @Field(() => ID)
  workspaceId!: string;

  @Field({ nullable: true })
  first?: number;

  @Field({ nullable: true })
  after?: string;

  @Field(() => [ActivityType], { nullable: true })
  types?: ActivityType[];

  @Field(() => ID, { nullable: true })
  actorUserId?: string;
}

@InputType()
export class ProjectActivityInput {
  @Field(() => ID)
  projectId!: string;

  @Field({ nullable: true })
  first?: number;

  @Field({ nullable: true })
  after?: string;

  @Field(() => [ActivityType], { nullable: true })
  types?: ActivityType[];
}

@InputType()
export class TaskActivityInput {
  @Field(() => ID)
  taskId!: string;

  @Field({ nullable: true })
  first?: number;

  @Field({ nullable: true })
  after?: string;

  @Field(() => [ActivityType], { nullable: true })
  types?: ActivityType[];
}
