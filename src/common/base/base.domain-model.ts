import { v4 as uuidv4 } from 'uuid';

/**
 * Base for all domain models. Zero framework dependencies — pure TypeScript.
 *
 * Why: The domain layer must be infrastructure-agnostic. If a domain model
 * imports from NestJS, MikroORM, or GraphQL, it becomes coupled to those
 * concerns and cannot be tested or reasoned about in isolation.
 *
 * Identity lives here because every aggregate/entity has an identity.
 * Timestamps are meaningful domain facts (when was this created/changed?),
 * not just persistence bookkeeping.
 */
export abstract class BaseDomainModel {
  readonly id: string;
  readonly createdAt: Date;
  updatedAt: Date;

  protected constructor(id?: string) {
    this.id = id ?? uuidv4();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  equals(other: BaseDomainModel): boolean {
    return this.id === other.id;
  }

  protected touch(): void {
    this.updatedAt = new Date();
  }
}
