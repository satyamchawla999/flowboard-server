import { Activity } from '../../domain/models/activity.model';
import { ActivitySubjectType } from '../../domain/value-objects/activity-subject-type.vo';
import { ActivityType } from '../../domain/value-objects/activity-type.vo';
import { InvalidActivityCursorError } from '../../domain/errors/activity.errors';
import { ActivityCursorService } from './activity-cursor.service';

describe('ActivityCursorService', () => {
  const service = new ActivityCursorService();

  it('round-trips occurredAt and id', () => {
    const activity = Activity.create({
      workspaceId: 'workspace-1',
      type: ActivityType.TASK_CREATED,
      subjectType: ActivitySubjectType.TASK,
      subjectId: 'task-1',
      occurredAt: new Date('2026-07-13T10:00:00.000Z'),
    });

    const decoded = service.decode(service.encode(activity));
    expect(decoded).toEqual({ occurredAt: activity.occurredAt, id: activity.id });
  });

  it('rejects invalid cursors', () => {
    expect(() => service.decode('not-a-cursor')).toThrow(InvalidActivityCursorError);
  });
});
