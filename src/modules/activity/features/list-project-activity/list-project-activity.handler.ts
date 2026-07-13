import { Inject, Injectable } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@modules/project/domain/contracts/project.repository';
import { ProjectNotFoundError } from '@modules/project/domain/errors/project.errors';
import { ProjectAccessService } from '@modules/project/infrastructure/services/project-access.service';
import {
  ActivityConnectionReadModel,
  ActivityFeedService,
} from '../../infrastructure/services/activity-feed.service';
import type { ListProjectActivityDto } from './list-project-activity.dto';

@Injectable()
export class ListProjectActivityHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    private readonly projectAccess: ProjectAccessService,
    private readonly feedService: ActivityFeedService,
  ) {}

  async execute(
    actorUserId: string,
    dto: ListProjectActivityDto,
  ): Promise<ActivityConnectionReadModel> {
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) throw new ProjectNotFoundError(dto.projectId);
    await this.projectAccess.ensureCanViewProject(actorUserId, project);
    return this.feedService.listProject(dto);
  }
}
