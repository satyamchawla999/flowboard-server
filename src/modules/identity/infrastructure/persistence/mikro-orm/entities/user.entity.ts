import { Entity, Property, Enum } from '@mikro-orm/core';
import { BaseEntity } from '@common/base';
import { AccountStatus } from '../../../../domain/value-objects/account-status.vo';

@Entity({ tableName: 'users' })
export class UserEntity extends BaseEntity {
  @Property({ unique: true })
  email!: string;

  @Property()
  displayName!: string;

  @Property({ default: 'UTC' })
  timezone: string = 'UTC';

  @Enum({ items: () => AccountStatus })
  accountStatus: AccountStatus = AccountStatus.UNVERIFIED;

  @Property({ type: 'text' })
  passwordHash!: string;

  @Property({ nullable: true, type: 'text' })
  passwordResetToken: string | null = null;

  @Property({ nullable: true })
  passwordResetTokenExpiresAt: Date | null = null;

  @Property({ nullable: true, type: 'text' })
  emailVerificationToken: string | null = null;

  @Property({ nullable: true })
  emailVerificationTokenExpiresAt: Date | null = null;
}
