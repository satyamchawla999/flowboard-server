import type { Task } from '../models/task.model';

export interface IActivityTaskReader {
  findActiveTaskById(taskId: string): Promise<Task | null>;
  findTaskSnapshotById(taskId: string): Promise<Task | null>;
}

export const ACTIVITY_TASK_READER = Symbol('IActivityTaskReader');
