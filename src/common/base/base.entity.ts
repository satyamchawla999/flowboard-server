import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base MikroORM entity. Lives in the infrastructure layer — not the domain.
 *
 * Why separated from BaseDomainModel: The domain model is the source of truth
 * for business logic. The entity is a persistence projection of that model.
 * Mixing them would force domain models to carry ORM decorators, leaking
 * infrastructure concerns into business logic.
 *
 * The mapper's job is to translate between these two representations.
 */
@Entity({ abstract: true })
export abstract class BaseEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
