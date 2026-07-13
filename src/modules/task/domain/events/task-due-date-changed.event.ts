export class TaskDueDateChangedEvent {
  static readonly EVENT_NAME = 'task.due_date_changed';

  constructor(
    public readonly taskId: string,
    public readonly workspaceId: string,
    public readonly projectId: string,
    public readonly actorUserId: string,
    public readonly previousDueDate: Date | null,
    public readonly newDueDate: Date | null,
  ) {}
}
