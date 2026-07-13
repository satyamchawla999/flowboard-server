import { Entity, Enum, Index, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';
import { ProjectHealthStatus } from '../../../../domain/value-objects/project-health-status.vo';

@Entity({ tableName: 'projects' })
@Unique({ properties: ['workspaceId', 'key'] })
@Index({ properties: ['workspaceId'] })
@Index({ properties: ['ownerUserId'] })
@Index({ properties: ['archivedAt'] })
@Index({ properties: ['deletedAt'] })
export class ProjectEntity extends BaseEntity {
  @Property({ type: 'uuid' })
  workspaceId!: string;

  @Property()
  name!: string;

  @Property()
  key!: string;

  @Property({ nullable: true, type: 'text' })
  description: string | null = null;

  @Property({ type: 'uuid' })
  ownerUserId!: string;

  @Property({ type: 'uuid' })
  createdByUserId!: string;

  @Enum({ items: () => ProjectHealthStatus })
  healthStatus: ProjectHealthStatus = ProjectHealthStatus.NOT_SET;

  @Property({ nullable: true, type: 'text' })
  statusMessage: string | null = null;

  @Property({ nullable: true })
  startDate: Date | null = null;

  @Property({ nullable: true })
  dueDate: Date | null = null;

  @Property({ nullable: true })
  archivedAt: Date | null = null;

  @Property({ nullable: true })
  deletedAt: Date | null = null;
}
