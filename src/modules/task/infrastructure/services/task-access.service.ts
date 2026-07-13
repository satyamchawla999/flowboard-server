import { Inject, Injectable } from '@nestjs/common';
import { WorkspaceMemberRole } from '@modules/membership/domain/value-objects/workspace-member-role.vo';
import {
  IProjectMemberRepository,
  PROJECT_MEMBER_REPOSITORY,
} from '@modules/project/domain/contracts/project-member.repository';
import type { Project } from '@modules/project/domain/models/project.model';
import { ProjectMemberRole } from '@modules/project/domain/value-objects/project-member-role.vo';
import { ProjectAccessService } from '@modules/project/infrastructure/services/project-access.service';
import { Task } from '../../domain/models/task.model';
import {
  InsufficientTaskPermissionError,
  TaskAssigneeNotEligibleError,
} from '../../domain/errors/task.errors';

@Injectable()
export class TaskAccessService {
  constructor(
    private readonly projectAccess: ProjectAccessService,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
  ) {}

  async ensureCanViewTask(userId: string, project: Project): Promise<void> {
    await this.projectAccess.ensureCanViewProject(userId, project);
  }

  async ensureCanCreateTask(userId: string, project: Project): Promise<void> {
    await this.projectAccess.ensureCanViewProject(userId, project);
  }

  async ensureCanUpdateTask(userId: string, project: Project, task: Task): Promise<void> {
    if (await this.isWorkspaceAdminOrOwner(userId, project.workspaceId)) return;
    if (await this.isProjectOwner(userId, project)) return;

    const projectMember = await this.projectMemberRepository.findByProjectAndUser(
      project.id,
      userId,
    );
    if (!projectMember) throw new InsufficientTaskPermissionError();
    if (task.reporterUserId === userId || task.assigneeUserId === userId || projectMember) return;
    throw new InsufficientTaskPermissionError();
  }

  async ensureCanAssignTask(userId: string, project: Project, task: Task): Promise<void> {
    await this.ensureCanUpdateTask(userId, project, task);
  }

  async ensureCanDeleteTask(userId: string, project: Project): Promise<void> {
    if (await this.isWorkspaceAdminOrOwner(userId, project.workspaceId)) return;
    if (await this.isProjectOwner(userId, project)) return;
    throw new InsufficientTaskPermissionError();
  }

  async ensureEligibleAssignee(userId: string, project: Project): Promise<void> {
    const projectMember = await this.projectMemberRepository.findByProjectAndUser(
      project.id,
      userId,
    );
    if (projectMember || project.ownerUserId === userId) return;
    throw new TaskAssigneeNotEligibleError(userId);
  }

  private async isWorkspaceAdminOrOwner(userId: string, workspaceId: string): Promise<boolean> {
    const role = await this.projectAccess.getWorkspaceRole(userId, workspaceId);
    return role === WorkspaceMemberRole.OWNER || role === WorkspaceMemberRole.ADMIN;
  }

  private async isProjectOwner(userId: string, project: Project): Promise<boolean> {
    if (project.ownerUserId === userId) return true;
    const projectMember = await this.projectMemberRepository.findByProjectAndUser(
      project.id,
      userId,
    );
    return projectMember?.role === ProjectMemberRole.OWNER;
  }
}
