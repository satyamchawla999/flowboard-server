import { Entity, Property, Enum } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';
import { TaskPriorityLevel } from '../../../../domain/value-objects/task-priority.vo';
import { TaskStatusValue } from '../../../../domain/value-objects/task-status.vo';

/**
 * MikroORM entity — a persistence projection of the Task domain model.
 *
 * Why flat enums instead of value objects: MikroORM works with plain values.
 * The mapper converts these back to value objects when constructing the domain
 * model. The entity never contains business logic.
 */
@Entity({ tableName: 'tasks' })
export class TaskEntity extends BaseEntity {
  @Property()
  title!: string;

  @Property({ nullable: true, type: 'text' })
  description: string | null = null;

  @Property({ type: 'uuid' })
  projectId!: string;

  @Property({ type: 'uuid', nullable: true })
  assigneeId: string | null = null;

  @Property({ type: 'uuid' })
  createdById!: string;

  @Enum({ items: () => TaskStatusValue })
  status: TaskStatusValue = TaskStatusValue.TODO;

  @Enum({ items: () => TaskPriorityLevel })
  priority: TaskPriorityLevel = TaskPriorityLevel.MEDIUM;
}
