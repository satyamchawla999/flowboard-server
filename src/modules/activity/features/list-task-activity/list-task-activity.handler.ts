import { Inject, Injectable } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@modules/project/domain/contracts/project.repository';
import { ProjectNotFoundError } from '@modules/project/domain/errors/project.errors';
import { ProjectAccessService } from '@modules/project/infrastructure/services/project-access.service';
import { ITaskRepository, TASK_REPOSITORY } from '@modules/task/domain/contracts/task.repository';
import { TaskNotFoundError } from '@modules/task/domain/errors/task.errors';
import {
  ActivityConnectionReadModel,
  ActivityFeedService,
} from '../../infrastructure/services/activity-feed.service';
import type { ListTaskActivityDto } from './list-task-activity.dto';

@Injectable()
export class ListTaskActivityHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    private readonly projectAccess: ProjectAccessService,
    private readonly feedService: ActivityFeedService,
  ) {}

  async execute(
    actorUserId: string,
    dto: ListTaskActivityDto,
  ): Promise<ActivityConnectionReadModel> {
    const task = await this.taskRepository.findById(dto.taskId);
    if (!task) throw new TaskNotFoundError(dto.taskId);
    const project = await this.projectRepository.findById(task.projectId);
    if (!project) throw new ProjectNotFoundError(task.projectId);
    await this.projectAccess.ensureCanViewProject(actorUserId, project);
    return this.feedService.listTask(dto);
  }
}
