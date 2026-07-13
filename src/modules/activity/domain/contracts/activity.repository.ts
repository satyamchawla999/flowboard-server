import type { Activity } from '../models/activity.model';
import type { ActivityType } from '../value-objects/activity-type.vo';

export interface ActivityCursor {
  occurredAt: Date;
  id: string;
}

export interface ActivityPage<T> {
  items: T[];
  hasNextPage: boolean;
}

export interface ListActivityOptions {
  first: number;
  after?: ActivityCursor;
  types?: ActivityType[];
  actorUserId?: string;
}

export interface IActivityRepository {
  append(activity: Activity): Promise<void>;
  findByEventId(eventId: string): Promise<Activity | null>;
  listByWorkspace(
    workspaceId: string,
    options: ListActivityOptions,
  ): Promise<ActivityPage<Activity>>;
  listByProject(projectId: string, options: ListActivityOptions): Promise<ActivityPage<Activity>>;
  listByTask(taskId: string, options: ListActivityOptions): Promise<ActivityPage<Activity>>;
}

export const ACTIVITY_REPOSITORY = Symbol('IActivityRepository');
