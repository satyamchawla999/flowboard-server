import { Inject, Injectable } from '@nestjs/common';
import { WorkspaceMemberRole } from '@modules/membership/domain/value-objects/workspace-member-role.vo';
import {
  IProjectMemberRepository,
  PROJECT_MEMBER_REPOSITORY,
} from '../../domain/contracts/project-member.repository';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/contracts/project.repository';
import type { Project } from '../../domain/models/project.model';
import { ProjectAccessService } from '../../infrastructure/services/project-access.service';
import type { ListWorkspaceProjectsDto } from './list-workspace-projects.dto';

@Injectable()
export class ListWorkspaceProjectsHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly projectAccess: ProjectAccessService,
  ) {}

  async execute(actorUserId: string, dto: ListWorkspaceProjectsDto): Promise<Project[]> {
    const role = await this.projectAccess.getWorkspaceRole(actorUserId, dto.workspaceId);

    if (role === WorkspaceMemberRole.OWNER || role === WorkspaceMemberRole.ADMIN) {
      return this.projectRepository.listByWorkspace(dto.workspaceId, {
        includeArchived: dto.includeArchived,
        search: dto.search,
      });
    }

    const projectIds = await this.projectMemberRepository.listProjectIdsForUser(
      dto.workspaceId,
      actorUserId,
    );

    return this.projectRepository.listByWorkspace(dto.workspaceId, {
      includeArchived: dto.includeArchived,
      search: dto.search,
      projectIds,
    });
  }
}
