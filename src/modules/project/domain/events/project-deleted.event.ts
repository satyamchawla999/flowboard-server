export class ProjectDeletedEvent {
  static readonly EVENT_NAME = 'project.deleted';

  constructor(
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly actorUserId: string,
  ) {}
}
