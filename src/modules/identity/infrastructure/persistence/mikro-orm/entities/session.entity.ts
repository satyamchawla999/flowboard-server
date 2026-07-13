import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';

@Entity({ tableName: 'sessions' })
export class SessionEntity extends BaseEntity {
  @Property({ type: 'uuid' })
  userId!: string;

  @Property({ type: 'text' })
  refreshTokenHash!: string;

  @Property({ nullable: true, type: 'text' })
  userAgent: string | null = null;

  @Property({ nullable: true })
  ipAddress: string | null = null;

  @Property()
  expiresAt!: Date;

  @Property({ nullable: true })
  revokedAt: Date | null = null;
}
