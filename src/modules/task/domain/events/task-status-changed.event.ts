export class TaskStatusChangedEvent {
  static readonly EVENT_NAME = 'task.status.changed';

  constructor(
    public readonly taskId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    public readonly changedById: string,
  ) {}
}
