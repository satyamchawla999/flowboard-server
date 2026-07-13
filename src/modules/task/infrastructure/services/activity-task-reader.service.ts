import { Inject, Injectable } from '@nestjs/common';
import { IActivityTaskReader } from '../../domain/contracts/activity-task-reader.service';
import { ITaskRepository, TASK_REPOSITORY } from '../../domain/contracts/task.repository';
import { Task } from '../../domain/models/task.model';

@Injectable()
export class ActivityTaskReader implements IActivityTaskReader {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async findActiveTaskById(taskId: string): Promise<Task | null> {
    return this.taskRepository.findById(taskId);
  }

  async findTaskSnapshotById(taskId: string): Promise<Task | null> {
    return this.taskRepository.findByIdIncludingDeleted(taskId);
  }
}
