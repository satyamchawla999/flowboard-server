import { Activity } from './activity.model';
import { ActivitySubjectType } from '../value-objects/activity-subject-type.vo';
import { ActivityType } from '../value-objects/activity-type.vo';

describe('Activity', () => {
  it('creates an immutable activity projection record', () => {
    const occurredAt = new Date('2026-07-13T10:00:00.000Z');
    const activity = Activity.create({
      eventId: 'event-1',
      workspaceId: 'workspace-1',
      projectId: 'project-1',
      actorUserId: 'user-1',
      type: ActivityType.PROJECT_CREATED,
      subjectType: ActivitySubjectType.PROJECT,
      subjectId: 'project-1',
      metadata: { projectName: 'Launch' },
      occurredAt,
    });

    expect(activity.eventId).toBe('event-1');
    expect(activity.workspaceId).toBe('workspace-1');
    expect(activity.projectId).toBe('project-1');
    expect(activity.type).toBe(ActivityType.PROJECT_CREATED);
    expect(activity.subjectType).toBe(ActivitySubjectType.PROJECT);
    expect(activity.metadata).toEqual({ projectName: 'Launch' });
    expect(activity.occurredAt).toBe(occurredAt);
    expect(activity.createdAt).toBeInstanceOf(Date);
  });
});
