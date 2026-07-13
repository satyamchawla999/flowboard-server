import type { ActivityType } from '../../domain/value-objects/activity-type.vo';

export interface ListTaskActivityDto {
  taskId: string;
  first?: number;
  after?: string;
  types?: ActivityType[];
}
