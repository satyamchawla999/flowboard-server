import { ApplicationError } from '@common/errors';
import { DomainError } from '@common/errors';

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`Email "${email}" is already registered`, 'EMAIL_ALREADY_EXISTS');
    this.name = 'EmailAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS');
    this.name = 'InvalidCredentialsError';
  }
}

export class AccountSuspendedError extends ApplicationError {
  constructor() {
    super('Your account has been suspended', 'ACCOUNT_SUSPENDED');
    this.name = 'AccountSuspendedError';
  }
}

export class SessionNotFoundError extends ApplicationError {
  constructor(sessionId: string) {
    super(`Session "${sessionId}" not found or already revoked`, 'SESSION_NOT_FOUND');
    this.name = 'SessionNotFoundError';
  }
}

export class InvalidOrExpiredTokenError extends ApplicationError {
  constructor() {
    super('Token is invalid or has expired', 'INVALID_OR_EXPIRED_TOKEN');
    this.name = 'InvalidOrExpiredTokenError';
  }
}

export class PasswordMismatchError extends ApplicationError {
  constructor() {
    super('Current password is incorrect', 'PASSWORD_MISMATCH');
    this.name = 'PasswordMismatchError';
  }
}
