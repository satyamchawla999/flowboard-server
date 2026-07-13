import { DomainError } from '@common/errors';

export class InvalidActivityCursorError extends DomainError {
  constructor() {
    super('Activity cursor is invalid', 'INVALID_ACTIVITY_CURSOR');
    this.name = 'InvalidActivityCursorError';
  }
}
