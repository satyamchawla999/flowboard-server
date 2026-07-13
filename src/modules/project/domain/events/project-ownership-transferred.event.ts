export class ProjectOwnershipTransferredEvent {
  static readonly EVENT_NAME = 'project.ownership_transferred';

  constructor(
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly previousOwnerUserId: string,
    public readonly newOwnerUserId: string,
    public readonly actorUserId: string,
  ) {}
}
