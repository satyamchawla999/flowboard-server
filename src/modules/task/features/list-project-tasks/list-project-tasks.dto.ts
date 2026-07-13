import type { TaskLifecycleStatusValue } from '../../domain/value-objects/task-lifecycle-status.vo';
import type { TaskPriorityLevel } from '../../domain/value-objects/task-priority.vo';

export interface ListProjectTasksDto {
  projectId: string;
  sectionId?: string;
  assigneeUserId?: string;
  lifecycleStatus?: TaskLifecycleStatusValue;
  priority?: TaskPriorityLevel;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}
