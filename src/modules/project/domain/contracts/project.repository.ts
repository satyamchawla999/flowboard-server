import type { Project } from '../models/project.model';

export interface ListWorkspaceProjectsOptions {
  includeArchived?: boolean;
  search?: string;
  projectIds?: string[];
}

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByWorkspaceAndKey(workspaceId: string, key: string): Promise<Project | null>;
  existsByWorkspaceAndKey(workspaceId: string, key: string): Promise<boolean>;
  listByWorkspace(workspaceId: string, options?: ListWorkspaceProjectsOptions): Promise<Project[]>;
  save(project: Project): Promise<void>;
}

export const PROJECT_REPOSITORY = Symbol('IProjectRepository');
