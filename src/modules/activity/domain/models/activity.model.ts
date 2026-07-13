import { BaseDomainModel } from '@common/base';
import type { ActivitySubjectType } from '../value-objects/activity-subject-type.vo';
import type { ActivityType } from '../value-objects/activity-type.vo';

export type ActivityMetadata = Record<string, unknown>;

interface CreateActivityProps {
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

interface ReconstituteActivityProps extends Required<
  Omit<CreateActivityProps, 'eventId' | 'metadata' | 'occurredAt'>
> {
  id: string;
  eventId: string | null;
  metadata: ActivityMetadata;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Activity extends BaseDomainModel {
  eventId: string | null;
  workspaceId: string;
  projectId: string | null;
  taskId: string | null;
  sectionId: string | null;
  actorUserId: string | null;
  type: ActivityType;
  subjectType: ActivitySubjectType;
  subjectId: string;
  metadata: ActivityMetadata;
  occurredAt: Date;

  private constructor(props: ReconstituteActivityProps) {
    super(props.id);
    this.eventId = props.eventId;
    this.workspaceId = props.workspaceId;
    this.projectId = props.projectId;
    this.taskId = props.taskId;
    this.sectionId = props.sectionId;
    this.actorUserId = props.actorUserId;
    this.type = props.type;
    this.subjectType = props.subjectType;
    this.subjectId = props.subjectId;
    this.metadata = props.metadata;
    this.occurredAt = props.occurredAt;
    (this as { createdAt: Date }).createdAt = props.createdAt;
    (this as { updatedAt: Date }).updatedAt = props.updatedAt;
  }

  static create(props: CreateActivityProps): Activity {
    const now = new Date();
    return new Activity({
      id: undefined as unknown as string,
      eventId: props.eventId ?? null,
      workspaceId: props.workspaceId,
      projectId: props.projectId ?? null,
      taskId: props.taskId ?? null,
      sectionId: props.sectionId ?? null,
      actorUserId: props.actorUserId ?? null,
      type: props.type,
      subjectType: props.subjectType,
      subjectId: props.subjectId,
      metadata: props.metadata ?? {},
      occurredAt: props.occurredAt ?? now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ReconstituteActivityProps): Activity {
    return new Activity(props);
  }
}
