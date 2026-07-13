import { Inject, Injectable } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@modules/project/domain/contracts/project.repository';
import { ProjectNotFoundError } from '@modules/project/domain/errors/project.errors';
import { ProjectAccessService } from '@modules/project/infrastructure/services/project-access.service';
import {
  ACTIVITY_TASK_READER,
  IActivityTaskReader,
} from '@modules/task/domain/contracts/activity-task-reader.service';
import { TaskNotFoundError } from '@modules/task/domain/errors/task.errors';
import {
  ActivityConnectionReadModel,
  ActivityFeedService,
} from '../../infrastructure/services/activity-feed.service';
import type { ListTaskActivityDto } from './list-task-activity.dto';

@Injectable()
export class ListTaskActivityHandler {
  constructor(
    @Inject(ACTIVITY_TASK_READER)
    private readonly activityTaskReader: IActivityTaskReader,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    private readonly projectAccess: ProjectAccessService,
    private readonly feedService: ActivityFeedService,
  ) {}

  async execute(
    actorUserId: string,
    dto: ListTaskActivityDto,
  ): Promise<ActivityConnectionReadModel> {
    const task = await this.activityTaskReader.findActiveTaskById(dto.taskId);
    if (!task) throw new TaskNotFoundError(dto.taskId);
    const project = await this.projectRepository.findById(task.projectId);
    if (!project) throw new ProjectNotFoundError(task.projectId);
    await this.projectAccess.ensureCanViewProject(actorUserId, project);
    return this.feedService.listTask(dto);
  }
}
