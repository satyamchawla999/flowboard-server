import type { ActivityType } from '../../domain/value-objects/activity-type.vo';

export interface ListWorkspaceActivityDto {
  workspaceId: string;
  first?: number;
  after?: string;
  types?: ActivityType[];
  actorUserId?: string;
}
