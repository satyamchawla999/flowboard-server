export class OwnershipTransferredEvent {
  static readonly EVENT_NAME = 'membership.ownership_transferred';

  constructor(
    public readonly workspaceId: string,
    public readonly previousOwnerUserId: string,
    public readonly newOwnerUserId: string,
  ) {}
}
