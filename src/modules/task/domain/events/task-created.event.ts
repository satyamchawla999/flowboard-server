/**
 * Domain events are plain objects — no decorators, no framework dependencies.
 *
 * Why: Domain events express that something meaningful happened in the domain.
 * They decouple the publisher (task being created) from subscribers
 * (activity log, notification, search index). Application handlers store
 * events in the outbox; the local relay later emits them inside the monolith.
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
