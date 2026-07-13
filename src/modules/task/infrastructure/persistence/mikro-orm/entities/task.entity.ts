import { Entity, Enum, Index, Property } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';
import { TaskLifecycleStatusValue } from '../../../../domain/value-objects/task-lifecycle-status.vo';
import { TaskPriorityLevel } from '../../../../domain/value-objects/task-priority.vo';

@Entity({ tableName: 'tasks' })
@Index({ properties: ['workspaceId'] })
@Index({ properties: ['projectId'] })
@Index({ properties: ['sectionId'] })
@Index({ properties: ['sectionId', 'position'] })
@Index({ properties: ['assigneeUserId'] })
@Index({ properties: ['reporterUserId'] })
@Index({ properties: ['lifecycleStatus'] })
@Index({ properties: ['dueDate'] })
@Index({ properties: ['deletedAt'] })
export class TaskEntity extends BaseEntity {
  @Property({ type: 'uuid' })
  workspaceId!: string;

  @Property({ type: 'uuid' })
  projectId!: string;

  @Property({ type: 'uuid' })
  sectionId!: string;

  @Property({ type: 'uuid', nullable: true })
  parentTaskId: string | null = null;

  @Property()
  title!: string;

  @Property({ nullable: true, type: 'text' })
  description: string | null = null;

  @Property({ type: 'uuid', nullable: true })
  assigneeUserId: string | null = null;

  @Property({ type: 'uuid' })
  reporterUserId!: string;

  @Enum({ items: () => TaskPriorityLevel })
  priority: TaskPriorityLevel = TaskPriorityLevel.NONE;

  @Enum({ items: () => TaskLifecycleStatusValue })
  lifecycleStatus: TaskLifecycleStatusValue = TaskLifecycleStatusValue.OPEN;

  @Property({ nullable: true })
  dueDate: Date | null = null;

  @Property({ type: 'decimal', precision: 20, scale: 6 })
  position!: string;

  @Property({ nullable: true })
  completedAt: Date | null = null;

  @Property({ nullable: true })
  deletedAt: Date | null = null;
}
