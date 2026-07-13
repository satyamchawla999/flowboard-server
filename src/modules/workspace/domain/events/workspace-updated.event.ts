export class WorkspaceUpdatedEvent {
  static readonly EVENT_NAME = 'workspace.updated';

  constructor(
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly slug: string,
  ) {}
}
