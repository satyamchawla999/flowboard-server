export class UserPasswordChangedEvent {
  static readonly EVENT_NAME = 'identity.user.password_changed';

  constructor(public readonly userId: string) {}
}
