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
import type { RenameProjectSectionDto } from './rename-project-section.dto';

@Injectable()
export class RenameProjectSectionHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_SECTION_REPOSITORY)
    private readonly sectionRepository: IProjectSectionRepository,
    private readonly projectAccess: ProjectAccessService,
    private readonly eventDispatcher: ProjectDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: RenameProjectSectionDto) {
    const section = await this.sectionRepository.findById(dto.sectionId);
    if (!section) throw new ProjectSectionNotFoundError(dto.sectionId);
    const project = await this.projectRepository.findById(section.projectId);
    if (!project) throw new ProjectNotFoundError(section.projectId);
    await this.projectAccess.ensureCanManageSections(actorUserId, project);
    project.updateDetails({}, actorUserId);
    project.pullDomainEvents();

    section.rename(dto.name, actorUserId);
    await this.sectionRepository.save(section);
    await this.eventDispatcher.dispatchAggregateEvents(section);
    return section;
  }
}
