export class UserProfileUpdatedEvent {
  static readonly EVENT_NAME = 'identity.user.profile_updated';

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly accountStatus: string,
  ) {}
}
