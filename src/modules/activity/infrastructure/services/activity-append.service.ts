import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ACTIVITY_REPOSITORY,
  IActivityRepository,
} from '../../domain/contracts/activity.repository';
import { Activity, ActivityMetadata } from '../../domain/models/activity.model';
import { ActivitySubjectType } from '../../domain/value-objects/activity-subject-type.vo';
import { ActivityType } from '../../domain/value-objects/activity-type.vo';

interface AppendActivityInput {
  eventName: string;
  eventId?: string | null;
  workspaceId: string;
  projectId?: string | null;
  taskId?: string | null;
  sectionId?: string | null;
  actorUserId?: string | null;
  type: ActivityType;
  subjectType: ActivitySubjectType;
  subjectId: string;
  metadata?: ActivityMetadata;
  occurredAt?: Date;
}

@Injectable()
export class ActivityAppendService {
  private readonly logger = new Logger(ActivityAppendService.name);

  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: IActivityRepository,
  ) {}

  async append(input: AppendActivityInput): Promise<void> {
    try {
      await this.activityRepository.append(
        Activity.create({
          eventId: input.eventId,
          workspaceId: input.workspaceId,
          projectId: input.projectId,
          taskId: input.taskId,
          sectionId: input.sectionId,
          actorUserId: input.actorUserId,
          type: input.type,
          subjectType: input.subjectType,
          subjectId: input.subjectId,
          metadata: input.metadata,
          occurredAt: input.occurredAt,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to project ${input.eventName} for subject ${input.subjectType}:${input.subjectId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
