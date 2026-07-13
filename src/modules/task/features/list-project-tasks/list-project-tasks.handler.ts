import { Inject, Injectable } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@modules/project/domain/contracts/project.repository';
import { ProjectNotFoundError } from '@modules/project/domain/errors/project.errors';
import { ITaskRepository, TASK_REPOSITORY } from '../../domain/contracts/task.repository';
import { Task } from '../../domain/models/task.model';
import { TaskAccessService } from '../../infrastructure/services/task-access.service';
import type { ListProjectTasksDto } from './list-project-tasks.dto';

@Injectable()
export class ListProjectTasksHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    private readonly taskAccess: TaskAccessService,
  ) {}

  async execute(actorUserId: string, dto: ListProjectTasksDto): Promise<Task[]> {
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) throw new ProjectNotFoundError(dto.projectId);
    await this.taskAccess.ensureCanViewTask(actorUserId, project);
    return this.taskRepository.listByProject(project.id, dto);
  }
}
