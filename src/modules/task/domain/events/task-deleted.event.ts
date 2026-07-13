export class TaskDeletedEvent {
  static readonly EVENT_NAME = 'task.deleted';

  constructor(
    public readonly taskId: string,
    public readonly workspaceId: string,
    public readonly projectId: string,
    public readonly actorUserId: string,
  ) {}
}
