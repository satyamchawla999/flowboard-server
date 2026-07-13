export class WorkspaceCreatedEvent {
  static readonly EVENT_NAME = 'workspace.created';

  constructor(
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly ownerId: string,
  ) {}
}
