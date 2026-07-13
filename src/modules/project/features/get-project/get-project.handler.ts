import { Inject, Injectable } from '@nestjs/common';
import { IProjectRepository, PROJECT_REPOSITORY } from '../../domain/contracts/project.repository';
import { Project } from '../../domain/models/project.model';
import { ProjectNotFoundError } from '../../domain/errors/project.errors';
import { ProjectAccessService } from '../../infrastructure/services/project-access.service';

@Injectable()
export class GetProjectHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    private readonly projectAccess: ProjectAccessService,
  ) {}

  async execute(
    actorUserId: string,
    options: { id?: string; workspaceId?: string; key?: string },
  ): Promise<Project> {
    const project = options.id
      ? await this.projectRepository.findById(options.id)
      : options.workspaceId && options.key
        ? await this.projectRepository.findByWorkspaceAndKey(
            options.workspaceId,
            Project.normalizeKey(options.key),
          )
        : null;

    if (!project) throw new ProjectNotFoundError(options.id ?? options.key ?? '');
    await this.projectAccess.ensureCanViewProject(actorUserId, project);
    return project;
  }
}
