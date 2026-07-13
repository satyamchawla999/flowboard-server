import type { ProjectUserProfile } from '../read-models/project-user-profile.read-model';

export interface IProjectUserProfileRepository {
  findByUserId(userId: string): Promise<ProjectUserProfile | null>;
  findByUserIds(userIds: string[]): Promise<ProjectUserProfile[]>;
  save(profile: ProjectUserProfile): Promise<void>;
}

export const PROJECT_USER_PROFILE_REPOSITORY = Symbol('IProjectUserProfileRepository');
