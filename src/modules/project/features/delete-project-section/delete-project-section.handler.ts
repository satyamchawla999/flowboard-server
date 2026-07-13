import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/contracts/project.repository';
import {
  IProjectSectionRepository,
  PROJECT_SECTION_REPOSITORY,
} from '../../domain/contracts/project-section.repository';
import { ProjectNotFoundError } from '../../domain/errors/project.errors';
import { ProjectSectionNotFoundError } from '../../domain/errors/project-section.errors';
import { ProjectAccessService } from '../../infrastructure/services/project-access.service';
import { ProjectDomainEventDispatcherService } from '../../infrastructure/services/project-domain-event-dispatcher.service';

@Injectable()
export class DeleteProjectSectionHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_SECTION_REPOSITORY)
    private readonly sectionRepository: IProjectSectionRepository,
    private readonly projectAccess: ProjectAccessService,
    private readonly eventDispatcher: ProjectDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, sectionId: string): Promise<void> {
    const section = await this.sectionRepository.findById(sectionId);
    if (!section) throw new ProjectSectionNotFoundError(sectionId);
    const project = await this.projectRepository.findById(section.projectId);
    if (!project) throw new ProjectNotFoundError(section.projectId);
    await this.projectAccess.ensureCanManageSections(actorUserId, project);
    project.updateDetails({}, actorUserId);
    project.pullDomainEvents();

    section.softDelete(actorUserId);
    await this.sectionRepository.save(section);
    this.eventDispatcher.dispatchAggregateEvents(section);
  }
}
