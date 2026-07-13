import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { TaskPriorityLevel } from '../../../domain/value-objects/task-priority.vo';
import { TaskStatusValue } from '../../../domain/value-objects/task-status.vo';

registerEnumType(TaskPriorityLevel, { name: 'TaskPriority' });
registerEnumType(TaskStatusValue, { name: 'TaskStatus' });

/**
 * GraphQL model — a presentation projection of the domain model.
 *
 * Why separate from the domain model: the domain model is optimized for
 * business rules. The GraphQL model is optimized for API consumers.
 * Fields may be renamed, omitted, or shaped differently without touching
 * domain logic. Decoupling these lets both evolve independently.
 */
@ObjectType('Task')
export class TaskGqlModel {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID)
  projectId!: string;

  @Field(() => ID, { nullable: true })
  assigneeId?: string;

  @Field(() => ID)
  createdById!: string;

  @Field(() => TaskStatusValue)
  status!: TaskStatusValue;

  @Field(() => TaskPriorityLevel)
  priority!: TaskPriorityLevel;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
