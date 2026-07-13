import { Inject, Injectable } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@modules/project/domain/contracts/project.repository';
import { ITaskRepository, TASK_REPOSITORY } from '../../domain/contracts/task.repository';
import { Task } from '../../domain/models/task.model';
import { TaskAccessService } from '../../infrastructure/services/task-access.service';
import type { ListMyAssignedTasksDto } from './list-my-assigned-tasks.dto';

@Injectable()
export class ListMyAssignedTasksHandler {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    private readonly taskAccess: TaskAccessService,
  ) {}

  async execute(actorUserId: string, dto: ListMyAssignedTasksDto = {}): Promise<Task[]> {
    const tasks = await this.taskRepository.listByAssignee(actorUserId, dto);
    const visible: Task[] = [];
    for (const task of tasks) {
      const project = await this.projectRepository.findById(task.projectId);
      if (!project) continue;
      try {
        await this.taskAccess.ensureCanViewTask(actorUserId, project);
        visible.push(task);
      } catch {
        continue;
      }
    }
    return visible;
  }
}
