import type { ProjectHealthStatus } from '@modules/project/domain/value-objects/project-health-status.vo';
import type { TaskLifecycleStatusValue } from '../value-objects/task-lifecycle-status.vo';
import type { TaskPriorityLevel } from '../value-objects/task-priority.vo';

export interface TaskUserReadModel {
  userId: string;
  email: string;
  displayName: string;
}

export interface ProjectListViewTaskReadModel {
  id: string;
  workspaceId: string;
  projectId: string;
  sectionId: string;
  title: string;
  description: string | null;
  lifecycleStatus: TaskLifecycleStatusValue;
  priority: TaskPriorityLevel;
  dueDate: Date | null;
  position: number;
  completedAt: Date | null;
  assignee: TaskUserReadModel | null;
  reporter: TaskUserReadModel | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectListViewSectionReadModel {
  id: string;
  name: string;
  position: number;
  tasks: ProjectListViewTaskReadModel[];
}

export interface ProjectListViewReadModel {
  project: {
    id: string;
    name: string;
    key: string;
    healthStatus: ProjectHealthStatus;
  };
  sections: ProjectListViewSectionReadModel[];
}
