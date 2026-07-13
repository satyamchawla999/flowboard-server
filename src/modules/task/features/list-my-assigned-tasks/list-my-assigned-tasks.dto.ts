import type { TaskLifecycleStatusValue } from '../../domain/value-objects/task-lifecycle-status.vo';

export interface ListMyAssignedTasksDto {
  workspaceId?: string;
  lifecycleStatus?: TaskLifecycleStatusValue;
}
