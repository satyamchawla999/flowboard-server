export class TaskReopenedEvent {
  static readonly EVENT_NAME = 'task.reopened';

  constructor(
    public readonly taskId: string,
    public readonly workspaceId: string,
    public readonly projectId: string,
    public readonly actorUserId: string,
  ) {}
}
