import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'workspace_user_profiles' })
@Index({ properties: ['email'] })
export class WorkspaceUserProfileEntity {
  @PrimaryKey({ type: 'uuid' })
  userId!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  displayName!: string;

  @Property()
  accountStatus!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
