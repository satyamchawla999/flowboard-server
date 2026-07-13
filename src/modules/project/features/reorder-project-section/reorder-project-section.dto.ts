export interface ReorderProjectSectionDto {
  sectionId: string;
  beforeSectionId?: string | null;
  afterSectionId?: string | null;
}
