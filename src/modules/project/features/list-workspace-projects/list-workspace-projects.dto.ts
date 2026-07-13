export interface ListWorkspaceProjectsDto {
  workspaceId: string;
  includeArchived?: boolean;
  search?: string;
}
