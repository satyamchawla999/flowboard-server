import type { ActivityType } from '../../domain/value-objects/activity-type.vo';

export interface ListProjectActivityDto {
  projectId: string;
  first?: number;
  after?: string;
  types?: ActivityType[];
}
