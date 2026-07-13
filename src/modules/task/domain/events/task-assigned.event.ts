export class TaskAssignedEvent {
  static readonly EVENT_NAME = 'task.assigned';

  constructor(
    public readonly taskId: string,
    public readonly workspaceId: string,
    public readonly projectId: string,
    public readonly actorUserId: string,
    public readonly assigneeUserId: string,
  ) {}
}
