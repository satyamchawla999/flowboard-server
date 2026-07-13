import { BaseDomainModel } from '@common/base';
import { InvalidOperationError } from '@common/errors';
import { AccountStatus } from '../value-objects/account-status.vo';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { UserPasswordChangedEvent } from '../events/user-password-changed.event';
import { UserProfileUpdatedEvent } from '../events/user-profile-updated.event';

interface CreateUserProps {
  email: string;
  displayName: string;
  passwordHash: string;
}

interface ReconstituteUserProps {
  id: string;
  email: string;
  displayName: string;
  timezone: string;
  accountStatus: AccountStatus;
  passwordHash: string;
  passwordResetToken: string | null;
  passwordResetTokenExpiresAt: Date | null;
  emailVerificationToken: string | null;
  emailVerificationTokenExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends BaseDomainModel {
  email: string;
  displayName: string;
  timezone: string;
  accountStatus: AccountStatus;
  passwordHash: string;
  passwordResetToken: string | null;
  passwordResetTokenExpiresAt: Date | null;
  emailVerificationToken: string | null;
  emailVerificationTokenExpiresAt: Date | null;

  private readonly _domainEvents: object[] = [];

  private constructor(props: ReconstituteUserProps) {
    super(props.id);
    this.email = props.email;
    this.displayName = props.displayName;
    this.timezone = props.timezone;
    this.accountStatus = props.accountStatus;
    this.passwordHash = props.passwordHash;
    this.passwordResetToken = props.passwordResetToken;
    this.passwordResetTokenExpiresAt = props.passwordResetTokenExpiresAt;
    this.emailVerificationToken = props.emailVerificationToken;
    this.emailVerificationTokenExpiresAt = props.emailVerificationTokenExpiresAt;
    (this as { createdAt: Date }).createdAt = props.createdAt;
    (this as { updatedAt: Date }).updatedAt = props.updatedAt;
  }

  static create(props: CreateUserProps): User {
    const user = new User({
      id: undefined as unknown as string,
      email: props.email,
      displayName: props.displayName,
      timezone: 'UTC',
      accountStatus: AccountStatus.UNVERIFIED,
      passwordHash: props.passwordHash,
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    user._domainEvents.push(
      new UserRegisteredEvent(user.id, user.email, user.displayName, user.accountStatus),
    );

    return user;
  }

  static reconstitute(props: ReconstituteUserProps): User {
    return new User(props);
  }

  updateDisplayName(displayName: string): void {
    this.displayName = displayName;
    this.touch();
    this._domainEvents.push(
      new UserProfileUpdatedEvent(this.id, this.email, this.displayName, this.accountStatus),
    );
  }

  updateTimezone(timezone: string): void {
    this.timezone = timezone;
    this.touch();
  }

  updatePasswordHash(hash: string): void {
    this.passwordHash = hash;
    this.touch();
    this._domainEvents.push(new UserPasswordChangedEvent(this.id));
  }

  setPasswordResetToken(hashedToken: string, expiresAt: Date): void {
    this.passwordResetToken = hashedToken;
    this.passwordResetTokenExpiresAt = expiresAt;
    this.touch();
  }

  clearPasswordResetToken(): void {
    this.passwordResetToken = null;
    this.passwordResetTokenExpiresAt = null;
    this.touch();
  }

  setEmailVerificationToken(hashedToken: string, expiresAt: Date): void {
    this.emailVerificationToken = hashedToken;
    this.emailVerificationTokenExpiresAt = expiresAt;
    this.touch();
  }

  activate(): void {
    if (this.accountStatus === AccountStatus.SUSPENDED) {
      throw new InvalidOperationError('Cannot activate a suspended account');
    }
    this.accountStatus = AccountStatus.ACTIVE;
    this.emailVerificationToken = null;
    this.emailVerificationTokenExpiresAt = null;
    this.touch();
    this._domainEvents.push(
      new UserProfileUpdatedEvent(this.id, this.email, this.displayName, this.accountStatus),
    );
  }

  suspend(): void {
    if (this.accountStatus === AccountStatus.DELETED) {
      throw new InvalidOperationError('Cannot suspend a deleted account');
    }
    this.accountStatus = AccountStatus.SUSPENDED;
    this.touch();
    this._domainEvents.push(
      new UserProfileUpdatedEvent(this.id, this.email, this.displayName, this.accountStatus),
    );
  }

  isActive(): boolean {
    return (
      this.accountStatus === AccountStatus.ACTIVE || this.accountStatus === AccountStatus.UNVERIFIED
    );
  }

  pullDomainEvents(): object[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }
}
