import { Inject, Injectable } from '@nestjs/common';
import {
  ACTIVITY_REPOSITORY,
  IActivityRepository,
} from '../../domain/contracts/activity.repository';
import { Activity } from '../../domain/models/activity.model';
import { ActivityType } from '../../domain/value-objects/activity-type.vo';
import { ActivityCursorService } from './activity-cursor.service';

export interface ActivityConnectionReadModel {
  edges: Array<{ cursor: string; node: Activity }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

@Injectable()
export class ActivityFeedService {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository,
    private readonly cursorService: ActivityCursorService,
  ) {}

  async listWorkspace(input: {
    workspaceId: string;
    first?: number;
    after?: string;
    types?: ActivityType[];
    actorUserId?: string;
  }): Promise<ActivityConnectionReadModel> {
    const page = await this.activityRepository.listByWorkspace(input.workspaceId, {
      first: this.normalizeFirst(input.first),
      after: this.cursorService.decode(input.after),
      types: input.types,
      actorUserId: input.actorUserId,
    });
    return this.toConnection(page.items, page.hasNextPage);
  }

  async listProject(input: {
    projectId: string;
    first?: number;
    after?: string;
    types?: ActivityType[];
  }): Promise<ActivityConnectionReadModel> {
    const page = await this.activityRepository.listByProject(input.projectId, {
      first: this.normalizeFirst(input.first),
      after: this.cursorService.decode(input.after),
      types: input.types,
    });
    return this.toConnection(page.items, page.hasNextPage);
  }

  async listTask(input: {
    taskId: string;
    first?: number;
    after?: string;
    types?: ActivityType[];
  }): Promise<ActivityConnectionReadModel> {
    const page = await this.activityRepository.listByTask(input.taskId, {
      first: this.normalizeFirst(input.first),
      after: this.cursorService.decode(input.after),
      types: input.types,
    });
    return this.toConnection(page.items, page.hasNextPage);
  }

  private toConnection(items: Activity[], hasNextPage: boolean): ActivityConnectionReadModel {
    const edges = items.map((activity) => ({
      cursor: this.cursorService.encode(activity),
      node: activity,
    }));
    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: edges.at(-1)?.cursor ?? null,
      },
    };
  }

  private normalizeFirst(first = 20): number {
    return Math.min(Math.max(first, 1), 100);
  }
}
