import { DomainError } from '@common/errors';

export class ProjectNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Project "${id}" was not found`, 'PROJECT_NOT_FOUND');
    this.name = 'ProjectNotFoundError';
  }
}

export class ProjectNameInvalidError extends DomainError {
  constructor(message = 'Project name must be between 3 and 120 characters') {
    super(message, 'PROJECT_NAME_INVALID');
    this.name = 'ProjectNameInvalidError';
  }
}

export class ProjectKeyInvalidError extends DomainError {
  constructor(message = 'Project key must be 2 to 12 uppercase letters or numbers') {
    super(message, 'PROJECT_KEY_INVALID');
    this.name = 'ProjectKeyInvalidError';
  }
}

export class ProjectKeyAlreadyExistsError extends DomainError {
  constructor(workspaceId: string, key: string) {
    super(
      `Project key "${key}" already exists in workspace "${workspaceId}"`,
      'PROJECT_KEY_ALREADY_EXISTS',
    );
    this.name = 'ProjectKeyAlreadyExistsError';
  }
}

export class ProjectArchivedError extends DomainError {
  constructor(id: string) {
    super(`Project "${id}" is archived and cannot be modified`, 'PROJECT_ARCHIVED');
    this.name = 'ProjectArchivedError';
  }
}

export class ProjectDeletedError extends DomainError {
  constructor(id: string) {
    super(`Project "${id}" is deleted`, 'PROJECT_DELETED');
    this.name = 'ProjectDeletedError';
  }
}

export class InvalidProjectDateRangeError extends DomainError {
  constructor() {
    super('Project start date must be before or equal to due date', 'INVALID_PROJECT_DATE_RANGE');
    this.name = 'InvalidProjectDateRangeError';
  }
}

export class ProjectMemberAlreadyExistsError extends DomainError {
  constructor(projectId: string, userId: string) {
    super(
      `User "${userId}" is already a member of project "${projectId}"`,
      'PROJECT_MEMBER_ALREADY_EXISTS',
    );
    this.name = 'ProjectMemberAlreadyExistsError';
  }
}

export class ProjectMemberNotFoundError extends DomainError {
  constructor(projectId: string, userId: string) {
    super(`User "${userId}" is not a member of project "${projectId}"`, 'PROJECT_MEMBER_NOT_FOUND');
    this.name = 'ProjectMemberNotFoundError';
  }
}

export class ProjectOwnerCannotBeRemovedError extends DomainError {
  constructor() {
    super(
      'Project owner cannot be removed through this operation',
      'PROJECT_OWNER_CANNOT_BE_REMOVED',
    );
    this.name = 'ProjectOwnerCannotBeRemovedError';
  }
}

export class ProjectOwnershipTransferInvalidError extends DomainError {
  constructor(message = 'Project ownership transfer is invalid') {
    super(message, 'PROJECT_OWNERSHIP_TRANSFER_INVALID');
    this.name = 'ProjectOwnershipTransferInvalidError';
  }
}

export class InsufficientProjectPermissionError extends DomainError {
  constructor() {
    super('Insufficient project permission', 'INSUFFICIENT_PROJECT_PERMISSION');
    this.name = 'InsufficientProjectPermissionError';
  }
}
