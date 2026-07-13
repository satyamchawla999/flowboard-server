import { ProjectHealthStatus } from '../../domain/value-objects/project-health-status.vo';

export interface UpdateProjectHealthDto {
  projectId: string;
  healthStatus: ProjectHealthStatus;
  statusMessage?: string | null;
}
