import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ProjectHealthStatus } from '@modules/project/domain/value-objects/project-health-status.vo';
import { TaskLifecycleStatusValue } from '../../../domain/value-objects/task-lifecycle-status.vo';
import { TaskPriorityLevel } from '../../../domain/value-objects/task-priority.vo';

registerEnumType(TaskPriorityLevel, { name: 'TaskPriority' });
registerEnumType(TaskLifecycleStatusValue, { name: 'TaskLifecycleStatus' });
registerEnumType(ProjectHealthStatus, { name: 'TaskListViewProjectHealthStatus' });

@ObjectType('TaskUser')
export class TaskUserGqlModel {
  @Field(() => ID)
  userId!: string;

  @Field()
  email!: string;

  @Field()
  displayName!: string;
}

@ObjectType('Task')
export class TaskGqlModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  workspaceId!: string;

  @Field(() => ID)
  projectId!: string;

  @Field(() => ID)
  sectionId!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID, { nullable: true })
  assigneeUserId?: string;

  @Field(() => ID)
  reporterUserId!: string;

  @Field(() => TaskPriorityLevel)
  priority!: TaskPriorityLevel;

  @Field(() => TaskLifecycleStatusValue)
  lifecycleStatus!: TaskLifecycleStatusValue;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field()
  position!: number;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType('ProjectListViewProject')
export class ProjectListViewProjectGqlModel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  key!: string;

  @Field(() => ProjectHealthStatus)
  healthStatus!: ProjectHealthStatus;
}

@ObjectType('ProjectListViewTask')
export class ProjectListViewTaskGqlModel extends TaskGqlModel {
  @Field(() => TaskUserGqlModel, { nullable: true })
  assignee?: TaskUserGqlModel;

  @Field(() => TaskUserGqlModel, { nullable: true })
  reporter?: TaskUserGqlModel;
}

@ObjectType('ProjectListViewSection')
export class ProjectListViewSectionGqlModel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  position!: number;

  @Field(() => [ProjectListViewTaskGqlModel])
  tasks!: ProjectListViewTaskGqlModel[];
}

@ObjectType('ProjectListView')
export class ProjectListViewGqlModel {
  @Field(() => ProjectListViewProjectGqlModel)
  project!: ProjectListViewProjectGqlModel;

  @Field(() => [ProjectListViewSectionGqlModel])
  sections!: ProjectListViewSectionGqlModel[];
}
