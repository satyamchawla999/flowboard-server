/**
 * Mapper contract. Each module's mapper translates between the three models:
 *   domain model  ↔  persistence entity  ↔  GraphQL model
 *
 * Why a base interface: enforces that mappers are explicit about the translation
 * surface. Infrastructure mappers implement toDomain + toPersistence.
 * GraphQL models are mapped separately in the resolver layer.
 *
 * DomainModel = pure domain object (no decorators)
 * PersistenceEntity = MikroORM entity
 */
export interface IMapper<DomainModel, PersistenceEntity> {
  toDomain(entity: PersistenceEntity): DomainModel;
  toPersistence(domain: DomainModel): PersistenceEntity;
}
