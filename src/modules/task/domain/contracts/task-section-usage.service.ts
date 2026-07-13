export interface ITaskSectionUsageService {
  hasActiveTasks(sectionId: string): Promise<boolean>;
  countActiveTasks(sectionId: string): Promise<number>;
}

export const TASK_SECTION_USAGE_SERVICE = Symbol('ITaskSectionUsageService');
