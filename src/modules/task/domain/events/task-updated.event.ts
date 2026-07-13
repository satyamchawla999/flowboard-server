export class TaskUpdatedEvent {
  static readonly EVENT_NAME = 'task.updated';

  constructor(
    public readonly taskId: string,
    public readonly workspaceId: string,
    public readonly projectId: string,
    public readonly actorUserId: string,
  ) {}
}
