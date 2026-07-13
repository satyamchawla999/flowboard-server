import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TransactionHost } from '@nestjs-cls/transactional';
import { MikroOrmTransactionalAdapter } from '@infrastructure/database/mikro-orm-transactional.adapter';
import type { IUserRepository } from '../../../../domain/contracts/user.repository';
import { User } from '../../../../domain/models/user.model';
import { UserEntity } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserMikroOrmRepository implements IUserRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly txHost: TransactionHost<MikroOrmTransactionalAdapter>,
    private readonly mapper: UserMapper,
  ) {}

  private get manager(): EntityManager {
    return this.txHost.tx ?? this.em;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.manager.findOne(UserEntity, { id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.manager.findAll(UserEntity);
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.manager.findOne(UserEntity, { email });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByPasswordResetToken(hashedToken: string): Promise<User | null> {
    const entity = await this.manager.findOne(UserEntity, { passwordResetToken: hashedToken });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEmailVerificationToken(hashedToken: string): Promise<User | null> {
    const entity = await this.manager.findOne(UserEntity, {
      emailVerificationToken: hashedToken,
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(user: User): Promise<void> {
    const em = this.manager;
    const existing = await em.findOne(UserEntity, { id: user.id });

    if (existing) {
      const updated = this.mapper.toPersistence(user);
      em.assign(existing, updated);
    } else {
      const entity = this.mapper.toPersistence(user);
      em.persist(entity);
    }

    await em.flush();
  }

  async delete(id: string): Promise<void> {
    const em = this.manager;
    const entity = await em.findOne(UserEntity, { id });
    if (entity) {
      em.remove(entity);
      await em.flush();
    }
  }
}
