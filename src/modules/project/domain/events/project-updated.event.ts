export class ProjectUpdatedEvent {
  static readonly EVENT_NAME = 'project.updated';

  constructor(
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly actorUserId: string,
  ) {}
}
