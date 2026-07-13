import { Inject, Injectable } from '@nestjs/common';
import {
  IProjectMemberRepository,
  PROJECT_MEMBER_REPOSITORY,
} from '../../domain/contracts/project-member.repository';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/contracts/project.repository';
import type { ProjectMember } from '../../domain/models/project-member.model';
import { ProjectNotFoundError } from '../../domain/errors/project.errors';
import { ProjectAccessService } from '../../infrastructure/services/project-access.service';

@Injectable()
export class ListProjectMembersHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly projectAccess: ProjectAccessService,
  ) {}

  async execute(actorUserId: string, projectId: string): Promise<ProjectMember[]> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new ProjectNotFoundError(projectId);
    await this.projectAccess.ensureCanViewProject(actorUserId, project);
    return this.projectMemberRepository.listByProject(projectId);
  }
}
