import { DomainError } from '@common/errors';

export class WorkspaceMemberAlreadyExistsError extends DomainError {
  constructor(workspaceId: string, userId: string) {
    super(
      `User "${userId}" is already a member of workspace "${workspaceId}"`,
      'WORKSPACE_MEMBER_ALREADY_EXISTS',
    );
    this.name = 'WorkspaceMemberAlreadyExistsError';
  }
}

export class WorkspaceInvitationAlreadyPendingError extends DomainError {
  constructor(workspaceId: string, email: string) {
    super(
      `A pending invitation already exists for "${email}" in workspace "${workspaceId}"`,
      'WORKSPACE_INVITATION_ALREADY_PENDING',
    );
    this.name = 'WorkspaceInvitationAlreadyPendingError';
  }
}

export class WorkspaceInvitationExpiredError extends DomainError {
  constructor() {
    super('Workspace invitation has expired', 'WORKSPACE_INVITATION_EXPIRED');
    this.name = 'WorkspaceInvitationExpiredError';
  }
}

export class WorkspaceInvitationInvalidError extends DomainError {
  constructor() {
    super('Workspace invitation is invalid', 'WORKSPACE_INVITATION_INVALID');
    this.name = 'WorkspaceInvitationInvalidError';
  }
}

export class WorkspaceInvitationEmailMismatchError extends DomainError {
  constructor() {
    super(
      'Workspace invitation email does not match the authenticated user',
      'WORKSPACE_INVITATION_EMAIL_MISMATCH',
    );
    this.name = 'WorkspaceInvitationEmailMismatchError';
  }
}

export class WorkspaceMemberNotFoundError extends DomainError {
  constructor(workspaceId: string, userId: string) {
    super(
      `User "${userId}" is not a member of workspace "${workspaceId}"`,
      'WORKSPACE_MEMBER_NOT_FOUND',
    );
    this.name = 'WorkspaceMemberNotFoundError';
  }
}

export class InsufficientWorkspacePermissionError extends DomainError {
  constructor() {
    super('Insufficient workspace permission', 'INSUFFICIENT_WORKSPACE_PERMISSION');
    this.name = 'InsufficientWorkspacePermissionError';
  }
}

export class CannotRemoveLastOwnerError extends DomainError {
  constructor() {
    super('Cannot remove the only workspace owner', 'CANNOT_REMOVE_LAST_OWNER');
    this.name = 'CannotRemoveLastOwnerError';
  }
}

export class CannotLeaveAsLastOwnerError extends DomainError {
  constructor() {
    super('Cannot leave workspace as the only owner', 'CANNOT_LEAVE_AS_LAST_OWNER');
    this.name = 'CannotLeaveAsLastOwnerError';
  }
}

export class CannotChangeOwnOwnerRoleError extends DomainError {
  constructor() {
    super('Cannot change your own owner role', 'CANNOT_CHANGE_OWN_OWNER_ROLE');
    this.name = 'CannotChangeOwnOwnerRoleError';
  }
}
