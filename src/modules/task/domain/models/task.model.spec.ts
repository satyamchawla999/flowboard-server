import { TaskDeletedError, TaskTitleInvalidError } from '../errors/task.errors';
import { Task } from './task.model';
import { TaskLifecycleStatusValue } from '../value-objects/task-lifecycle-status.vo';
import { TaskPriority, TaskPriorityLevel } from '../value-objects/task-priority.vo';

describe('Task', () => {
  const createTask = () =>
    Task.create({
      workspaceId: 'workspace-1',
      projectId: 'project-1',
      sectionId: 'section-1',
      title: 'Write brief',
      reporterUserId: 'user-1',
      priority: TaskPriority.NONE,
      position: 1000,
    });

  it('validates title', () => {
    expect(() =>
      Task.create({
        workspaceId: 'workspace-1',
        projectId: 'project-1',
        sectionId: 'section-1',
        title: ' ',
        reporterUserId: 'user-1',
        position: 1000,
      }),
    ).toThrow(TaskTitleInvalidError);
  });

  it('sets completedAt when completed and clears it when reopened', () => {
    const task = createTask();
    task.complete('user-1');
    expect(task.lifecycleStatus.value).toBe(TaskLifecycleStatusValue.COMPLETED);
    expect(task.completedAt).toBeInstanceOf(Date);

    task.reopen('user-1');
    expect(task.lifecycleStatus.value).toBe(TaskLifecycleStatusValue.OPEN);
    expect(task.completedAt).toBeNull();
  });

  it('moves to another section and updates position', () => {
    const task = createTask();
    task.moveToSection('section-2', 2000, 'user-1');
    expect(task.sectionId).toBe('section-2');
    expect(task.position).toBe(2000);
  });

  it('reorders within its section', () => {
    const task = createTask();
    task.reorder(1500, 'user-1');
    expect(task.position).toBe(1500);
  });

  it('changes priority', () => {
    const task = createTask();
    task.changePriority(TaskPriority.from(TaskPriorityLevel.URGENT), 'user-1');
    expect(task.priority.value).toBe(TaskPriorityLevel.URGENT);
  });

  it('soft deletes and blocks later mutation', () => {
    const task = createTask();
    task.softDelete('user-1');
    expect(task.deletedAt).toBeInstanceOf(Date);
    expect(() => task.updateDetails({ title: 'Changed' }, 'user-1')).toThrow(TaskDeletedError);
  });
});
