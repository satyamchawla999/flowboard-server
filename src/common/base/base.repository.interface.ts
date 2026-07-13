/**
 * Generic repository contract. Belongs to the domain layer — domain defines
 * what it needs, infrastructure provides it.
 *
 * Why: Inverting this dependency means the domain never imports from MikroORM.
 * Application services depend on this interface. The concrete implementation
 * (MikroORM) is injected at runtime via NestJS DI.
 *
 * This contract is intentionally minimal. Add domain-specific finders
 * in the concrete repository interface (e.g., ITaskRepository).
 */
export interface IBaseRepository<TModel> {
  findById(id: string): Promise<TModel | null>;
  findAll(): Promise<TModel[]>;
  save(model: TModel): Promise<void>;
  delete(id: string): Promise<void>;
}
