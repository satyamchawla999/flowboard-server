import type { IBaseRepository } from '@common/base';
import type { User } from '../models/user.model';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByPasswordResetToken(hashedToken: string): Promise<User | null>;
  findByEmailVerificationToken(hashedToken: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
