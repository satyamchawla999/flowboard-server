import { Entity, Enum, Index, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';
import { ProjectMemberRole } from '../../../../domain/value-objects/project-member-role.vo';

@Entity({ tableName: 'project_members' })
@Unique({ properties: ['projectId', 'userId'] })
@Index({ properties: ['workspaceId'] })
@Index({ properties: ['projectId'] })
@Index({ properties: ['userId'] })
@Index({ properties: ['role'] })
export class ProjectMemberEntity extends BaseEntity {
  @Property({ type: 'uuid' })
  workspaceId!: string;

  @Property({ type: 'uuid' })
  projectId!: string;

  @Property({ type: 'uuid' })
  userId!: string;

  @Enum({ items: () => ProjectMemberRole })
  role: ProjectMemberRole = ProjectMemberRole.MEMBER;

  @Property()
  joinedAt: Date = new Date();
}
