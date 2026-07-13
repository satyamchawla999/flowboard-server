import type { TaskPriorityLevel } from '../../domain/value-objects/task-priority.vo';

export interface ChangeTaskPriorityDto {
  taskId: string;
  priority: TaskPriorityLevel;
}
