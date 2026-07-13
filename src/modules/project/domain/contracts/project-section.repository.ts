import type { ProjectSection } from '../models/project-section.model';

export interface IProjectSectionRepository {
  findById(id: string): Promise<ProjectSection | null>;
  findByIdIncludingDeleted(id: string): Promise<ProjectSection | null>;
  listByProject(projectId: string): Promise<ProjectSection[]>;
  listByProjectIncludingDeleted(projectId: string): Promise<ProjectSection[]>;
  findLastByProject(projectId: string): Promise<ProjectSection | null>;
  save(section: ProjectSection): Promise<void>;
  saveMany(sections: ProjectSection[]): Promise<void>;
}

export const PROJECT_SECTION_REPOSITORY = Symbol('IProjectSectionRepository');
