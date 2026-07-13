import { Inject, Injectable } from '@nestjs/common';
import { ITaskRepository, TASK_REPOSITORY } from '../../domain/contracts/task.repository';
import { ITaskSectionUsageService } from '../../domain/contracts/task-section-usage.service';

@Injectable()
export class TaskSectionUsageService implements ITaskSectionUsageService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async hasActiveTasks(sectionId: string): Promise<boolean> {
    return (await this.countActiveTasks(sectionId)) > 0;
  }

  async countActiveTasks(sectionId: string): Promise<number> {
    return this.taskRepository.countActiveBySection(sectionId);
  }
}
