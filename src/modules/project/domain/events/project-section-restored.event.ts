export class ProjectSectionRestoredEvent {
  static readonly EVENT_NAME = 'project.section_restored';

  constructor(
    public readonly sectionId: string,
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly actorUserId: string,
  ) {}
}
