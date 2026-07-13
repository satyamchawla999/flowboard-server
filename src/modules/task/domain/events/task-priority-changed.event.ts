import type { TaskPriorityLevel } from '../value-objects/task-priority.vo';

export class TaskPriorityChangedEvent {
  static readonly EVENT_NAME = 'task.priority_changed';

  constructor(
    public readonly taskId: string,
    public readonly workspaceId: string,
    public readonly projectId: string,
    public readonly actorUserId: string,
    public readonly previousPriority: TaskPriorityLevel,
    public readonly newPriority: TaskPriorityLevel,
  ) {}
}
