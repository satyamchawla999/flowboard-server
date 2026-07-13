import type { IBaseRepository } from '@common/base';
import type { Task } from '../models/task.model';

/**
 * Repository contract defined by the domain — not the infrastructure.
 *
 * Why: This interface expresses what the domain layer needs in its own terms.
 * The implementation (MikroORM) lives in infrastructure and is injected via DI.
 * The domain never knows how persistence works — only that it works.
 */
export interface ITaskRepository extends IBaseRepository<Task> {
  findByProjectId(projectId: string): Promise<Task[]>;
  findByAssigneeId(assigneeId: string): Promise<Task[]>;
}

export const TASK_REPOSITORY = Symbol('ITaskRepository');
