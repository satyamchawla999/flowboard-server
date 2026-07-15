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
import { ProjectSectionPositionService } from '../../infrastructure/services/project-section-position.service';

@Injectable()
export class RestoreProjectSectionHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_SECTION_REPOSITORY)
    private readonly sectionRepository: IProjectSectionRepository,
    private readonly projectAccess: ProjectAccessService,
    private readonly positionService: ProjectSectionPositionService,
    private readonly eventDispatcher: ProjectDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, sectionId: string) {
    const section = await this.sectionRepository.findByIdIncludingDeleted(sectionId);
    if (!section) throw new ProjectSectionNotFoundError(sectionId);
    const project = await this.projectRepository.findById(section.projectId);
    if (!project) throw new ProjectNotFoundError(section.projectId);
    await this.projectAccess.ensureCanManageSections(actorUserId, project);
    project.updateDetails({}, actorUserId);
    project.pullDomainEvents();

    const position = this.positionService.appendAfter(
      await this.sectionRepository.findLastByProject(project.id),
    );
    section.restore(position, actorUserId);
    await this.sectionRepository.save(section);
    await this.eventDispatcher.dispatchAggregateEvents(section);
    return section;
  }
}
