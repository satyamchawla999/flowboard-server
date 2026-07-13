export class TaskCompletedEvent {
  static readonly EVENT_NAME = 'task.completed';

  constructor(
    public readonly taskId: string,
    public readonly workspaceId: string,
    public readonly projectId: string,
    public readonly actorUserId: string,
    public readonly completedAt: Date,
  ) {}
}
