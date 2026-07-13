import { EntityManager, type TransactionOptions } from '@mikro-orm/core';
import type { TransactionalAdapter, TransactionalAdapterOptions } from '@nestjs-cls/transactional';

export class MikroOrmTransactionalAdapter implements TransactionalAdapter<
  EntityManager,
  EntityManager,
  TransactionOptions
> {
  connectionToken = EntityManager;
  supportsTransactionProxy = true;

  optionsFactory(
    entityManager: EntityManager,
  ): TransactionalAdapterOptions<EntityManager, TransactionOptions> {
    return {
      wrapWithTransaction: (options, fn, setTx) =>
        entityManager.transactional(async (transactionalEntityManager) => {
          setTx(transactionalEntityManager);
          return fn();
        }, options),
      getFallbackInstance: () => entityManager,
    };
  }
}
