import { Project } from './project.model';
import { ProjectHealthStatus } from '../value-objects/project-health-status.vo';
import {
  InvalidProjectDateRangeError,
  ProjectArchivedError,
  ProjectDeletedError,
  ProjectKeyInvalidError,
  ProjectNameInvalidError,
} from '../errors/project.errors';

function createProject(overrides: Partial<Parameters<typeof Project.create>[0]> = {}): Project {
  return Project.create({
    workspaceId: '2f55d28c-3f68-4f5e-9db0-a9f555599001',
    name: 'FlowBoard Backend',
    key: 'FLOW',
    ownerUserId: '2f55d28c-3f68-4f5e-9db0-a9f555599002',
    createdByUserId: '2f55d28c-3f68-4f5e-9db0-a9f555599002',
    ...overrides,
  });
}

describe('Project', () => {
  it('normalizes project keys and creates a project', () => {
    const project = createProject({ key: ' flow ' });

    expect(project.key).toBe('FLOW');
    expect(project.healthStatus).toBe(ProjectHealthStatus.NOT_SET);
    expect(project.isArchived).toBe(false);
    expect(project.isDeleted).toBe(false);
  });

  it('rejects invalid names and keys', () => {
    expect(() => createProject({ name: 'No' })).toThrow(ProjectNameInvalidError);
    expect(() => createProject({ key: '!' })).toThrow(ProjectKeyInvalidError);
  });

  it('validates date range', () => {
    expect(() =>
      createProject({
        startDate: new Date('2026-02-02'),
        dueDate: new Date('2026-02-01'),
      }),
    ).toThrow(InvalidProjectDateRangeError);
  });

  it('prevents updates while archived', () => {
    const project = createProject();

    project.archive(project.ownerUserId);

    expect(() => project.updateDetails({ name: 'New Backend' }, project.ownerUserId)).toThrow(
      ProjectArchivedError,
    );
  });

  it('prevents restoring deleted projects', () => {
    const project = createProject();

    project.softDelete(project.ownerUserId);

    expect(() => project.restore(project.ownerUserId)).toThrow(ProjectDeletedError);
  });

  it('updates health and transfers ownership', () => {
    const project = createProject();
    const newOwnerId = '2f55d28c-3f68-4f5e-9db0-a9f555599003';

    project.updateHealth(ProjectHealthStatus.AT_RISK, 'Schedule pressure', project.ownerUserId);
    project.transferOwnership(newOwnerId, project.ownerUserId);

    expect(project.healthStatus).toBe(ProjectHealthStatus.AT_RISK);
    expect(project.statusMessage).toBe('Schedule pressure');
    expect(project.ownerUserId).toBe(newOwnerId);
  });
});
