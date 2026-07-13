import { Entity, Property, Enum } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';
import { TaskView } from '../../../../domain/value-objects/workspace-preferences.vo';

@Entity({ tableName: 'workspaces' })
export class WorkspaceEntity extends BaseEntity {
  @Property()
  name!: string;

  @Property({ unique: true })
  slug!: string;

  @Property({ nullable: true, type: 'text' })
  description: string | null = null;

  @Property({ nullable: true, type: 'text' })
  logo: string | null = null;

  @Property({ default: 'UTC' })
  timezone: string = 'UTC';

  @Property({ type: 'uuid' })
  ownerId!: string;

  @Property({ default: false })
  isArchived: boolean = false;

  @Property({ default: false })
  isDeleted: boolean = false;

  // Preferences embedded as columns
  @Enum({ items: () => TaskView, default: TaskView.BOARD })
  defaultTaskView: TaskView = TaskView.BOARD;

  @Property({ default: 'UTC' })
  defaultTimezone: string = 'UTC';

  @Property({ nullable: true, type: 'text' })
  notificationSettings: string | null = null;

  @Property({ nullable: true, type: 'text' })
  automationRules: string | null = null;

  @Property({ nullable: true, type: 'text' })
  customStatuses: string | null = null;
}
