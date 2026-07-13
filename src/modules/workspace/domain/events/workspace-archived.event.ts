export class WorkspaceArchivedEvent {
  static readonly EVENT_NAME = 'workspace.archived';

  constructor(public readonly workspaceId: string) {}
}
