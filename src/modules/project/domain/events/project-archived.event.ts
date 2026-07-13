export class ProjectArchivedEvent {
  static readonly EVENT_NAME = 'project.archived';

  constructor(
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly actorUserId: string,
  ) {}
}
