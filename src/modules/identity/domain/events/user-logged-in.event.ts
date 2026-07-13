export class UserLoggedInEvent {
  static readonly EVENT_NAME = 'identity.user.logged_in';

  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
    public readonly ipAddress: string | null,
  ) {}
}
