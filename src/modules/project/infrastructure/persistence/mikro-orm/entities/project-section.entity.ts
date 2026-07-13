import { Entity, Index, Property } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';

@Entity({ tableName: 'project_sections' })
@Index({ properties: ['workspaceId'] })
@Index({ properties: ['projectId'] })
@Index({ properties: ['projectId', 'position'] })
@Index({ properties: ['deletedAt'] })
export class ProjectSectionEntity extends BaseEntity {
  @Property({ type: 'uuid' })
  workspaceId!: string;

  @Property({ type: 'uuid' })
  projectId!: string;

  @Property()
  name!: string;

  @Property({ type: 'decimal', precision: 20, scale: 6 })
  position!: string;

  @Property({ nullable: true })
  deletedAt: Date | null = null;
}
