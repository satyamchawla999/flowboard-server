export class ProjectSectionDeletedEvent {
  static readonly EVENT_NAME = 'project.section_deleted';

  constructor(
    public readonly sectionId: string,
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly actorUserId: string,
  ) {}
}
