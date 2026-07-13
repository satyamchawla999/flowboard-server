import { Inject, Injectable } from '@nestjs/common';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/contracts/project.repository';
import {
  IProjectSectionRepository,
  PROJECT_SECTION_REPOSITORY,
} from '../../domain/contracts/project-section.repository';
import type { ProjectSection } from '../../domain/models/project-section.model';
import { ProjectNotFoundError } from '../../domain/errors/project.errors';
import { ProjectSectionNotFoundError } from '../../domain/errors/project-section.errors';
import { ProjectAccessService } from '../../infrastructure/services/project-access.service';

@Injectable()
export class GetProjectSectionHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_SECTION_REPOSITORY)
    private readonly sectionRepository: IProjectSectionRepository,
    private readonly projectAccess: ProjectAccessService,
  ) {}

  async execute(actorUserId: string, sectionId: string): Promise<ProjectSection> {
    const section = await this.sectionRepository.findById(sectionId);
    if (!section) throw new ProjectSectionNotFoundError(sectionId);
    const project = await this.projectRepository.findById(section.projectId);
    if (!project) throw new ProjectNotFoundError(section.projectId);
    await this.projectAccess.ensureCanViewProject(actorUserId, project);
    return section;
  }
}
