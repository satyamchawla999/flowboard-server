export interface UpdateProjectDatesDto {
  projectId: string;
  startDate?: Date | null;
  dueDate?: Date | null;
}
