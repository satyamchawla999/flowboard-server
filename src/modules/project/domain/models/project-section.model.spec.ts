import { ProjectSection } from './project-section.model';
import {
  InvalidProjectSectionPositionError,
  ProjectSectionDeletedError,
  ProjectSectionNameInvalidError,
} from '../errors/project-section.errors';

function createSection(overrides: Partial<Parameters<typeof ProjectSection.create>[0]> = {}) {
  return ProjectSection.create({
    workspaceId: '2f55d28c-3f68-4f5e-9db0-a9f555599001',
    projectId: '2f55d28c-3f68-4f5e-9db0-a9f555599002',
    name: ' General ',
    position: 1000,
    actorUserId: '2f55d28c-3f68-4f5e-9db0-a9f555599003',
    ...overrides,
  });
}

describe('ProjectSection', () => {
  it('trims and validates section names', () => {
    const section = createSection();

    expect(section.name).toBe('General');
    expect(() => createSection({ name: '   ' })).toThrow(ProjectSectionNameInvalidError);
  });

  it('validates positive finite positions', () => {
    expect(() => createSection({ position: 0 })).toThrow(InvalidProjectSectionPositionError);
  });

  it('renames and repositions active sections', () => {
    const section = createSection();

    section.rename('TO-DO', section.id);
    section.moveTo(1500, section.id);

    expect(section.name).toBe('TO-DO');
    expect(section.position).toBe(1500);
  });

  it('soft deletes and restores sections', () => {
    const section = createSection();

    section.softDelete(section.id);
    expect(section.isDeleted).toBe(true);

    section.restore(2000, section.id);
    expect(section.isDeleted).toBe(false);
    expect(section.position).toBe(2000);
  });

  it('cannot modify deleted sections', () => {
    const section = createSection();
    section.softDelete(section.id);

    expect(() => section.rename('Done', section.id)).toThrow(ProjectSectionDeletedError);
    expect(() => section.moveTo(2000, section.id)).toThrow(ProjectSectionDeletedError);
  });
});
