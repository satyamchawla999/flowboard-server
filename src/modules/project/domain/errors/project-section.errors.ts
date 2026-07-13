import { DomainError } from '@common/errors';

export class ProjectSectionNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Project section "${id}" was not found`, 'PROJECT_SECTION_NOT_FOUND');
    this.name = 'ProjectSectionNotFoundError';
  }
}

export class ProjectSectionNameInvalidError extends DomainError {
  constructor(message = 'Project section name must be between 1 and 100 characters') {
    super(message, 'PROJECT_SECTION_NAME_INVALID');
    this.name = 'ProjectSectionNameInvalidError';
  }
}

export class ProjectSectionDeletedError extends DomainError {
  constructor(id: string) {
    super(`Project section "${id}" is deleted`, 'PROJECT_SECTION_DELETED');
    this.name = 'ProjectSectionDeletedError';
  }
}

export class ProjectSectionHasTasksError extends DomainError {
  constructor(id: string) {
    super(`Project section "${id}" still has active tasks`, 'PROJECT_SECTION_HAS_TASKS');
    this.name = 'ProjectSectionHasTasksError';
  }
}

export class InvalidProjectSectionPositionError extends DomainError {
  constructor(message = 'Project section position is invalid') {
    super(message, 'INVALID_PROJECT_SECTION_POSITION');
    this.name = 'InvalidProjectSectionPositionError';
  }
}

export class ProjectSectionProjectMismatchError extends DomainError {
  constructor() {
    super('Project sections must belong to the same project', 'PROJECT_SECTION_PROJECT_MISMATCH');
    this.name = 'ProjectSectionProjectMismatchError';
  }
}
