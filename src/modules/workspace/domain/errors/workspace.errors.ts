import { DomainError } from '@common/errors';

export class SlugAlreadyExistsError extends DomainError {
  constructor(slug: string) {
    super(`Workspace slug "${slug}" already exists`, 'SLUG_ALREADY_EXISTS');
    this.name = 'SlugAlreadyExistsError';
  }
}

export class WorkspaceArchivedError extends DomainError {
  constructor(id: string) {
    super(`Workspace "${id}" is archived and cannot be modified`, 'WORKSPACE_ARCHIVED');
    this.name = 'WorkspaceArchivedError';
  }
}

export class WorkspaceDeletedError extends DomainError {
  constructor(id: string) {
    super(`Workspace "${id}" is deleted`, 'WORKSPACE_DELETED');
    this.name = 'WorkspaceDeletedError';
  }
}

export class InvalidWorkspaceNameError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_WORKSPACE_NAME');
    this.name = 'InvalidWorkspaceNameError';
  }
}
