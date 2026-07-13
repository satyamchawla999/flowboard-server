import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TransactionHost } from '@nestjs-cls/transactional';
import { MikroOrmTransactionalAdapter } from '@infrastructure/database/mikro-orm-transactional.adapter';
import type { ISessionRepository } from '../../../../domain/contracts/session.repository';
import { Session } from '../../../../domain/models/session.model';
import { SessionEntity } from '../entities/session.entity';
import { SessionMapper } from '../mappers/session.mapper';

@Injectable()
export class SessionMikroOrmRepository implements ISessionRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly txHost: TransactionHost<MikroOrmTransactionalAdapter>,
    private readonly mapper: SessionMapper,
  ) {}

  private get manager(): EntityManager {
    return this.txHost.tx ?? this.em;
  }

  async findById(id: string): Promise<Session | null> {
    const entity = await this.manager.findOne(SessionEntity, { id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Session[]> {
    const entities = await this.manager.findAll(SessionEntity);
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    const now = new Date();
    const entities = await this.manager.find(SessionEntity, {
      userId,
      revokedAt: null,
      expiresAt: { $gt: now },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    const now = new Date();
    await this.manager.nativeUpdate(
      SessionEntity,
      { userId, revokedAt: null },
      { revokedAt: now, updatedAt: now },
    );
  }

  async revokeActiveById(id: string): Promise<boolean> {
    const now = new Date();
    const affectedRows = await this.manager.nativeUpdate(
      SessionEntity,
      {
        id,
        revokedAt: null,
        expiresAt: { $gt: now },
      },
      {
        revokedAt: now,
        updatedAt: now,
      },
    );

    return affectedRows === 1;
  }

  async save(session: Session): Promise<void> {
    const em = this.manager;
    const existing = await em.findOne(SessionEntity, { id: session.id });

    if (existing) {
      const updated = this.mapper.toPersistence(session);
      em.assign(existing, updated);
    } else {
      const entity = this.mapper.toPersistence(session);
      em.persist(entity);
    }

    await em.flush();
  }

  async delete(id: string): Promise<void> {
    const em = this.manager;
    const entity = await em.findOne(SessionEntity, { id });
    if (entity) {
      em.remove(entity);
      await em.flush();
    }
  }
}
