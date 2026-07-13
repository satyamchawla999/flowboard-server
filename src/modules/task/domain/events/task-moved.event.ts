export class TaskMovedEvent {
  static readonly EVENT_NAME = 'task.moved';

  constructor(
    public readonly taskId: string,
    public readonly workspaceId: string,
    public readonly projectId: string,
    public readonly actorUserId: string,
    public readonly fromSectionId: string,
    public readonly toSectionId: string,
    public readonly previousPosition: number,
    public readonly newPosition: number,
  ) {}
}
