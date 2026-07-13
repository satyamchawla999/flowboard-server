import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/contracts/project.repository';
import { ProjectNotFoundError } from '../../domain/errors/project.errors';
import { ProjectAccessService } from '../../infrastructure/services/project-access.service';
import { ProjectDomainEventDispatcherService } from '../../infrastructure/services/project-domain-event-dispatcher.service';

@Injectable()
export class DeleteProjectHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    private readonly projectAccess: ProjectAccessService,
    private readonly eventDispatcher: ProjectDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(actorUserId: string, projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new ProjectNotFoundError(projectId);
    await this.projectAccess.ensureCanDeleteProject(actorUserId, project);

    project.softDelete(actorUserId);
    await this.projectRepository.save(project);
    this.eventDispatcher.dispatchAggregateEvents(project);
  }
}
