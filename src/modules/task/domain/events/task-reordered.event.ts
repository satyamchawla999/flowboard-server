export class TaskReorderedEvent {
  static readonly EVENT_NAME = 'task.reordered';

  constructor(
    public readonly taskId: string,
    public readonly workspaceId: string,
    public readonly projectId: string,
    public readonly actorUserId: string,
    public readonly previousPosition: number,
    public readonly newPosition: number,
  ) {}
}
