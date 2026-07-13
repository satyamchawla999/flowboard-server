import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import type { IMembershipUserProfileRepository } from '../../../../domain/contracts/membership-user-profile.repository';
import { MembershipUserProfile } from '../../../../domain/read-models/membership-user-profile.read-model';
import { MembershipUserProfileEntity } from '../entities/membership-user-profile.entity';
import { MembershipUserProfileMapper } from '../mappers/membership-user-profile.mapper';

@Injectable()
export class MembershipUserProfileMikroOrmRepository implements IMembershipUserProfileRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: MembershipUserProfileMapper,
  ) {}

  async findByUserId(userId: string): Promise<MembershipUserProfile | null> {
    const entity = await this.em.findOne(MembershipUserProfileEntity, { userId });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<MembershipUserProfile | null> {
    const entity = await this.em.findOne(MembershipUserProfileEntity, {
      email: email.toLowerCase(),
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<MembershipUserProfile[]> {
    const entities = await this.em.findAll(MembershipUserProfileEntity);
    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async save(profile: MembershipUserProfile): Promise<void> {
    const existing = await this.em.findOne(MembershipUserProfileEntity, {
      userId: profile.userId,
    });

    if (existing) {
      const updated = this.mapper.toPersistence(profile);
      this.em.assign(existing, updated);
    } else {
      const entity = this.mapper.toPersistence(profile);
      this.em.persist(entity);
    }

    await this.em.flush();
  }

  async delete(userId: string): Promise<void> {
    const entity = await this.em.findOne(MembershipUserProfileEntity, { userId });
    if (entity) {
      this.em.remove(entity);
      await this.em.flush();
    }
  }
}
