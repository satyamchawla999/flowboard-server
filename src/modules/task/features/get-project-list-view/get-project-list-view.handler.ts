import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@modules/project/domain/contracts/project.repository';
import { ProjectNotFoundError } from '@modules/project/domain/errors/project.errors';
import { ProjectAccessService } from '@modules/project/infrastructure/services/project-access.service';
import { ProjectListViewReadModel } from '../../domain/read-models/project-list-view.read-model';
import { ProjectListViewQueryService } from '../../infrastructure/services/project-list-view-query.service';

@Injectable()
export class GetProjectListViewHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    private readonly queryService: ProjectListViewQueryService,
    private readonly projectAccess: ProjectAccessService,
  ) {}

  async execute(actorUserId: string, projectId: string): Promise<ProjectListViewReadModel> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) throw new ProjectNotFoundError(projectId);
    await this.projectAccess.ensureCanViewProject(actorUserId, project);

    const listView = await this.queryService.get(projectId);
    if (!listView) throw new ProjectNotFoundError(projectId);
    return listView;
  }
}
