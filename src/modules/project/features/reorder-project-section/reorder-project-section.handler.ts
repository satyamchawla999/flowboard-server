import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/contracts/project.repository';
import {
  IProjectSectionRepository,
  PROJECT_SECTION_REPOSITORY,
} from '../../domain/contracts/project-section.repository';
import { ProjectSection } from '../../domain/models/project-section.model';
import { ProjectNotFoundError } from '../../domain/errors/project.errors';
import {
  InvalidProjectSectionPositionError,
  ProjectSectionNotFoundError,
  ProjectSectionProjectMismatchError,
} from '../../domain/errors/project-section.errors';
import { ProjectAccessService } from '../../infrastructure/services/project-access.service';
import { ProjectDomainEventDispatcherService } from '../../infrastructure/services/project-domain-event-dispatcher.service';
import { ProjectSectionPositionService } from '../../infrastructure/services/project-section-position.service';
import type { ReorderProjectSectionDto } from './reorder-project-section.dto';

@Injectable()
export class ReorderProjectSectionHandler {
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
  async execute(actorUserId: string, dto: ReorderProjectSectionDto): Promise<ProjectSection> {
    if (dto.beforeSectionId && dto.afterSectionId) {
      throw new InvalidProjectSectionPositionError(
        'Specify either beforeSectionId or afterSectionId',
      );
    }

    const section = await this.sectionRepository.findById(dto.sectionId);
    if (!section) throw new ProjectSectionNotFoundError(dto.sectionId);
    const project = await this.projectRepository.findById(section.projectId);
    if (!project) throw new ProjectNotFoundError(section.projectId);
    await this.projectAccess.ensureCanManageSections(actorUserId, project);
    project.updateDetails({}, actorUserId);
    project.pullDomainEvents();

    let before = dto.beforeSectionId
      ? await this.sectionRepository.findById(dto.beforeSectionId)
      : null;
    let after = dto.afterSectionId
      ? await this.sectionRepository.findById(dto.afterSectionId)
      : null;
    if ((dto.beforeSectionId && !before) || (dto.afterSectionId && !after)) {
      throw new InvalidProjectSectionPositionError();
    }
    for (const candidate of [before, after]) {
      if (candidate && candidate.projectId !== section.projectId) {
        throw new ProjectSectionProjectMismatchError();
      }
    }

    if (this.positionService.needsRebalance(after, before)) {
      const sections = await this.sectionRepository.listByProject(project.id);
      this.positionService.rebalance(sections);
      await this.sectionRepository.saveMany(sections);
      before = dto.beforeSectionId
        ? await this.sectionRepository.findById(dto.beforeSectionId)
        : null;
      after = dto.afterSectionId ? await this.sectionRepository.findById(dto.afterSectionId) : null;
    }

    const position =
      before || after
        ? this.positionService.between(after, before)
        : this.positionService.appendAfter(
            await this.sectionRepository.findLastByProject(project.id),
          );

    section.moveTo(position, actorUserId);
    await this.sectionRepository.save(section);
    await this.eventDispatcher.dispatchAggregateEvents(section);
    return section;
  }
}
