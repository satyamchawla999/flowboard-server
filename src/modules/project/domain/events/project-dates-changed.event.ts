export class ProjectDatesChangedEvent {
  static readonly EVENT_NAME = 'project.dates_changed';

  constructor(
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly actorUserId: string,
  ) {}
}
