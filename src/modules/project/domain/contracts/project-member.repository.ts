import type { ProjectMember } from '../models/project-member.model';
import { ProjectMemberRole } from '../value-objects/project-member-role.vo';

export interface IProjectMemberRepository {
  findByProjectAndUser(projectId: string, userId: string): Promise<ProjectMember | null>;
  listByProject(projectId: string): Promise<ProjectMember[]>;
  listProjectIdsForUser(workspaceId: string, userId: string): Promise<string[]>;
  countByProjectAndRole(projectId: string, role: ProjectMemberRole): Promise<number>;
  save(member: ProjectMember): Promise<void>;
  delete(id: string): Promise<void>;
}

export const PROJECT_MEMBER_REPOSITORY = Symbol('IProjectMemberRepository');
