export class UserRegisteredEvent {
  static readonly EVENT_NAME = 'identity.user.registered';

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly accountStatus: string,
  ) {}
}
