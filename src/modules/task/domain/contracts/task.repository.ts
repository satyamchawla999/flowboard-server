import type { TaskLifecycleStatusValue } from '../value-objects/task-lifecycle-status.vo';
import type { TaskPriorityLevel } from '../value-objects/task-priority.vo';
import type { Task } from '../models/task.model';

export interface ListProjectTasksFilters {
  sectionId?: string;
  assigneeUserId?: string;
  lifecycleStatus?: TaskLifecycleStatusValue;
  priority?: TaskPriorityLevel;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

export interface ListAssignedTasksFilters {
  workspaceId?: string;
  lifecycleStatus?: TaskLifecycleStatusValue;
}

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findByIdIncludingDeleted(id: string): Promise<Task | null>;
  listByProject(projectId: string, filters?: ListProjectTasksFilters): Promise<Task[]>;
  listByAssignee(userId: string, filters?: ListAssignedTasksFilters): Promise<Task[]>;
  listBySection(projectId: string, sectionId: string): Promise<Task[]>;
  findLastBySection(projectId: string, sectionId: string): Promise<Task | null>;
  countActiveBySection(sectionId: string): Promise<number>;
  save(task: Task): Promise<void>;
  saveMany(tasks: Task[]): Promise<void>;
}

export const TASK_REPOSITORY = Symbol('ITaskRepository');
