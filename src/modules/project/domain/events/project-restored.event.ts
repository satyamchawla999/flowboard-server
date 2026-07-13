export class ProjectRestoredEvent {
  static readonly EVENT_NAME = 'project.restored';

  constructor(
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly actorUserId: string,
  ) {}
}
