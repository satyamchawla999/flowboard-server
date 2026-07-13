export interface MoveTaskToSectionDto {
  taskId: string;
  targetSectionId: string;
  beforeTaskId?: string;
  afterTaskId?: string;
}
