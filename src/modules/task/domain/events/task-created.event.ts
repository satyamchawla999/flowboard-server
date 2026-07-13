/**
 * Domain events are plain objects — no decorators, no framework dependencies.
 *
 * Why: Domain events express that something meaningful happened in the domain.
 * They decouple the publisher (task being created) from the subscribers
 * (activity log, notification, search index). This is EventEmitter2-based,
 * not CQRS — intentionally simple for a modular monolith at this scale.
 */
export class TaskCreatedEvent {
  static readonly EVENT_NAME = 'task.created';

  constructor(
    public readonly taskId: string,
    public readonly workspaceId: string,
    public readonly projectId: string,
    public readonly sectionId: string,
    public readonly reporterUserId: string,
  ) {}
}
