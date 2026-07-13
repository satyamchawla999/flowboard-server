import { Inject, Injectable } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@modules/project/domain/contracts/project.repository';
import {
  IProjectSectionRepository,
  PROJECT_SECTION_REPOSITORY,
} from '@modules/project/domain/contracts/project-section.repository';
import {
  IProjectUserProfileRepository,
  PROJECT_USER_PROFILE_REPOSITORY,
} from '@modules/project/domain/contracts/project-user-profile.repository';
import {
  ProjectListViewReadModel,
  ProjectListViewTaskReadModel,
  TaskUserReadModel,
} from '../../domain/read-models/project-list-view.read-model';
import { ITaskRepository, TASK_REPOSITORY } from '../../domain/contracts/task.repository';

@Injectable()
export class ProjectListViewQueryService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_SECTION_REPOSITORY)
    private readonly sectionRepository: IProjectSectionRepository,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    @Inject(PROJECT_USER_PROFILE_REPOSITORY)
    private readonly profileRepository: IProjectUserProfileRepository,
  ) {}

  async get(projectId: string): Promise<ProjectListViewReadModel | null> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) return null;

    const sections = await this.sectionRepository.listByProject(projectId);
    const tasks = await this.taskRepository.listByProject(projectId);
    const userIds = new Set<string>();
    for (const task of tasks) {
      userIds.add(task.reporterUserId);
      if (task.assigneeUserId) userIds.add(task.assigneeUserId);
    }

    const profiles = await this.profileRepository.findByUserIds([...userIds]);
    const profileByUserId = new Map(
      profiles.map((profile) => [
        profile.userId,
        { userId: profile.userId, email: profile.email, displayName: profile.displayName },
      ]),
    );

    const tasksBySection = new Map<string, ProjectListViewTaskReadModel[]>();
    for (const task of tasks) {
      const sectionTasks = tasksBySection.get(task.sectionId) ?? [];
      sectionTasks.push({
        id: task.id,
        workspaceId: task.workspaceId,
        projectId: task.projectId,
        sectionId: task.sectionId,
        title: task.title,
        description: task.description,
        lifecycleStatus: task.lifecycleStatus.value,
        priority: task.priority.value,
        dueDate: task.dueDate,
        position: task.position,
        completedAt: task.completedAt,
        assignee: this.profileFor(task.assigneeUserId, profileByUserId),
        reporter: this.profileFor(task.reporterUserId, profileByUserId),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
      tasksBySection.set(task.sectionId, sectionTasks);
    }

    return {
      project: {
        id: project.id,
        name: project.name,
        key: project.key,
        healthStatus: project.healthStatus,
      },
      sections: sections.map((section) => ({
        id: section.id,
        name: section.name,
        position: section.position,
        tasks: (tasksBySection.get(section.id) ?? []).sort(
          (left, right) => left.position - right.position,
        ),
      })),
    };
  }

  private profileFor(
    userId: string | null,
    profileByUserId: Map<string, TaskUserReadModel>,
  ): TaskUserReadModel | null {
    if (!userId) return null;
    return profileByUserId.get(userId) ?? null;
  }
}
