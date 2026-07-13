import type { WorkspaceUserProfile } from '../read-models/workspace-user-profile.read-model';

export interface IWorkspaceUserProfileRepository {
  findByUserId(userId: string): Promise<WorkspaceUserProfile | null>;
  findByEmail(email: string): Promise<WorkspaceUserProfile | null>;
  save(profile: WorkspaceUserProfile): Promise<void>;
  delete(userId: string): Promise<void>;
}

export const WORKSPACE_USER_PROFILE_REPOSITORY = Symbol('IWorkspaceUserProfileRepository');
