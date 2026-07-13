import { Inject, Injectable } from '@nestjs/common';
import { MembershipAccessService } from '@modules/membership/infrastructure/services/membership-access.service';
import { WorkspaceMemberRole } from '@modules/membership/domain/value-objects/workspace-member-role.vo';
import {
  IProjectMemberRepository,
  PROJECT_MEMBER_REPOSITORY,
} from '../../domain/contracts/project-member.repository';
import type { Project } from '../../domain/models/project.model';
import { InsufficientProjectPermissionError } from '../../domain/errors/project.errors';
import { ProjectMemberRole } from '../../domain/value-objects/project-member-role.vo';

@Injectable()
export class ProjectAccessService {
  constructor(
    private readonly membershipAccess: MembershipAccessService,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
  ) {}

  async ensureCanCreateProject(userId: string, workspaceId: string): Promise<void> {
    await this.membershipAccess.ensureAdminOrOwner(userId, workspaceId);
  }

  async ensureWorkspaceMember(userId: string, workspaceId: string): Promise<void> {
    await this.membershipAccess.ensureMember(userId, workspaceId);
  }

  async ensureCanViewProject(userId: string, project: Project): Promise<void> {
    if (await this.isWorkspaceAdminOrOwner(userId, project.workspaceId)) return;

    const projectMember = await this.projectMemberRepository.findByProjectAndUser(
      project.id,
      userId,
    );
    if (!projectMember) throw new InsufficientProjectPermissionError();
  }

  async ensureCanManageProject(userId: string, project: Project): Promise<void> {
    if (await this.isWorkspaceAdminOrOwner(userId, project.workspaceId)) return;
    if (project.ownerUserId === userId) return;

    const projectMember = await this.projectMemberRepository.findByProjectAndUser(
      project.id,
      userId,
    );
    if (projectMember?.role === ProjectMemberRole.OWNER) return;

    throw new InsufficientProjectPermissionError();
  }

  async ensureCanDeleteProject(userId: string, project: Project): Promise<void> {
    await this.membershipAccess.ensureAdminOrOwner(userId, project.workspaceId);
  }

  async getWorkspaceRole(userId: string, workspaceId: string): Promise<WorkspaceMemberRole> {
    return this.membershipAccess.getRole(userId, workspaceId);
  }

  private async isWorkspaceAdminOrOwner(userId: string, workspaceId: string): Promise<boolean> {
    const role = await this.membershipAccess.getRole(userId, workspaceId);
    return role === WorkspaceMemberRole.OWNER || role === WorkspaceMemberRole.ADMIN;
  }
}
