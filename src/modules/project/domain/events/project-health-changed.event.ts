import type { ProjectHealthStatus } from '../value-objects/project-health-status.vo';

export class ProjectHealthChangedEvent {
  static readonly EVENT_NAME = 'project.health_changed';

  constructor(
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly previousHealthStatus: ProjectHealthStatus,
    public readonly healthStatus: ProjectHealthStatus,
    public readonly actorUserId: string,
  ) {}
}
