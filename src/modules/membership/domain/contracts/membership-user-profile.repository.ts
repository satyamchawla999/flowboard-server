import type { MembershipUserProfile } from '../read-models/membership-user-profile.read-model';

export interface IMembershipUserProfileRepository {
  findByUserId(userId: string): Promise<MembershipUserProfile | null>;
  findByEmail(email: string): Promise<MembershipUserProfile | null>;
  findAll(): Promise<MembershipUserProfile[]>;
  save(profile: MembershipUserProfile): Promise<void>;
  delete(userId: string): Promise<void>;
}

export const MEMBERSHIP_USER_PROFILE_REPOSITORY = Symbol('IMembershipUserProfileRepository');
