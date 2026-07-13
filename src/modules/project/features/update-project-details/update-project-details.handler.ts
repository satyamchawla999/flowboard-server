import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/contracts/project.repository';
import { Project } from '../../domain/models/project.model';
import { ProjectNotFoundError } from '../../domain/errors/project.errors';
import { ProjectAccessService } from '../../infrastructure/services/project-access.service';
import { ProjectDomainEventDispatcherService } from '../../infrastructure/services/project-domain-event-dispatcher.service';
import type { UpdateProjectDetailsDto } from './update-project-details.dto';

@Injectable()
export class UpdateProjectDetailsHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    private readonly projectAccess: ProjectAccessService,
    private readonly eventDispatcher: ProjectDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, dto: UpdateProjectDetailsDto): Promise<Project> {
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) throw new ProjectNotFoundError(dto.projectId);
    await this.projectAccess.ensureCanManageProject(actorUserId, project);

    project.updateDetails({ name: dto.name, description: dto.description }, actorUserId);
    await this.projectRepository.save(project);
    this.eventDispatcher.dispatchAggregateEvents(project);
    return project;
  }
}
