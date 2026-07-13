import type { TaskPriorityLevel } from '../../domain/value-objects/task-priority.vo';

export interface CreateTaskDto {
  projectId: string;
  sectionId?: string;
  title: string;
  description?: string | null;
  assigneeUserId?: string | null;
  priority?: TaskPriorityLevel;
  dueDate?: Date | null;
  beforeTaskId?: string;
  afterTaskId?: string;
}
