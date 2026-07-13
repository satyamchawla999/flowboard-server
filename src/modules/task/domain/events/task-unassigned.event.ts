export class TaskUnassignedEvent {
  static readonly EVENT_NAME = 'task.unassigned';

  constructor(
    public readonly taskId: string,
    public readonly workspaceId: string,
    public readonly projectId: string,
    public readonly actorUserId: string,
    public readonly previousAssigneeUserId: string | null,
  ) {}
}
