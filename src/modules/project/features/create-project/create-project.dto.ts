export interface CreateProjectDto {
  workspaceId: string;
  name: string;
  key?: string | null;
  description?: string | null;
  ownerUserId?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
}
