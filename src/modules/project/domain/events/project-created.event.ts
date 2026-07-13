export class ProjectCreatedEvent {
  static readonly EVENT_NAME = 'project.created';

  constructor(
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly key: string,
    public readonly ownerUserId: string,
    public readonly createdByUserId: string,
  ) {}
}
