/**
 * Application-layer errors — thrown by application services.
 * Still framework-agnostic; translated at the boundary.
 */
export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ApplicationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}
