export class ProjectSectionReorderedEvent {
  static readonly EVENT_NAME = 'project.section_reordered';

  constructor(
    public readonly sectionId: string,
    public readonly projectId: string,
    public readonly workspaceId: string,
    public readonly actorUserId: string,
    public readonly previousPosition: number,
    public readonly newPosition: number,
  ) {}
}
