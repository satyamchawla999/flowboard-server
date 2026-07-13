/**
 * Base for all domain-layer errors. No framework dependencies.
 *
 * Why: Domain errors carry business meaning ("task not found", "invalid status
 * transition") rather than HTTP status codes. The exception filter translates
 * these at the boundary — the domain doesn't know about HTTP or GraphQL.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" was not found`, 'ENTITY_NOT_FOUND');
    this.name = 'EntityNotFoundError';
  }
}

export class InvalidOperationError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_OPERATION');
    this.name = 'InvalidOperationError';
  }
}
