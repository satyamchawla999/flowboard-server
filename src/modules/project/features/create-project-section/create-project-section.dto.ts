export interface CreateProjectSectionDto {
  projectId: string;
  name: string;
  beforeSectionId?: string | null;
  afterSectionId?: string | null;
}
