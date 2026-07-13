import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Add seeders for each domain as development data grows.
    // Example:
    //   await new TaskSeeder().run(em);
    void em;
  }
}
