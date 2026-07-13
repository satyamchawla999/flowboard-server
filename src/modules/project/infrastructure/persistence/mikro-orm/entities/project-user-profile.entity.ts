import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'project_user_profiles' })
@Index({ properties: ['email'] })
export class ProjectUserProfileEntity {
  @PrimaryKey({ type: 'uuid' })
  userId!: string;

  @Property()
  email!: string;

  @Property()
  displayName!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
