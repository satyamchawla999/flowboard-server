import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '@modules/project/domain/contracts/project.repository';
import {
  IProjectUserProfileRepository,
  PROJECT_USER_PROFILE_REPOSITORY,
} from '@modules/project/domain/contracts/project-user-profile.repository';
import { ProjectArchivedEvent } from '@modules/project/domain/events/project-archived.event';
import { ProjectCreatedEvent } from '@modules/project/domain/events/project-created.event';
import { ProjectDatesChangedEvent } from '@modules/project/domain/events/project-dates-changed.event';
import { ProjectDeletedEvent } from '@modules/project/domain/events/project-deleted.event';
import { ProjectHealthChangedEvent } from '@modules/project/domain/events/project-health-changed.event';
import { ProjectMemberAddedEvent } from '@modules/project/domain/events/project-member-added.event';
import { ProjectMemberRemovedEvent } from '@modules/project/domain/events/project-member-removed.event';
import { ProjectOwnershipTransferredEvent } from '@modules/project/domain/events/project-ownership-transferred.event';
import { ProjectRestoredEvent } from '@modules/project/domain/events/project-restored.event';
import { ProjectUpdatedEvent } from '@modules/project/domain/events/project-updated.event';
import { ActivitySubjectType } from '../../domain/value-objects/activity-subject-type.vo';
import { ActivityType } from '../../domain/value-objects/activity-type.vo';
import { ActivityAppendService } from '../services/activity-append.service';

@Injectable()
export class ProjectActivityProjectionListener {
  constructor(
    private readonly appendService: ActivityAppendService,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_USER_PROFILE_REPOSITORY)
    private readonly profileRepository: IProjectUserProfileRepository,
  ) {}

  @OnEvent(ProjectCreatedEvent.EVENT_NAME)
  async onProjectCreated(event: ProjectCreatedEvent): Promise<void> {
    const project = await this.projectRepository.findById(event.projectId);
    await this.appendProject(event, ActivityType.PROJECT_CREATED, event.createdByUserId, {
      projectName: project?.name,
      projectKey: event.key,
      ownerUserId: event.ownerUserId,
    });
  }

  @OnEvent(ProjectUpdatedEvent.EVENT_NAME)
  async onProjectUpdated(event: ProjectUpdatedEvent): Promise<void> {
    const project = await this.projectRepository.findById(event.projectId);
    await this.appendProject(event, ActivityType.PROJECT_UPDATED, event.actorUserId, {
      projectName: project?.name,
      changedFields: [],
    });
  }

  @OnEvent(ProjectHealthChangedEvent.EVENT_NAME)
  async onProjectHealthChanged(event: ProjectHealthChangedEvent): Promise<void> {
    const project = await this.projectRepository.findById(event.projectId);
    await this.appendProject(event, ActivityType.PROJECT_HEALTH_CHANGED, event.actorUserId, {
      projectName: project?.name,
      previousHealthStatus: event.previousHealthStatus,
      newHealthStatus: event.healthStatus,
      statusMessage: project?.statusMessage,
    });
  }

  @OnEvent(ProjectDatesChangedEvent.EVENT_NAME)
  async onProjectDatesChanged(event: ProjectDatesChangedEvent): Promise<void> {
    const project = await this.projectRepository.findById(event.projectId);
    await this.appendProject(event, ActivityType.PROJECT_DATES_CHANGED, event.actorUserId, {
      projectName: project?.name,
      newStartDate: project?.startDate?.toISOString() ?? null,
      newDueDate: project?.dueDate?.toISOString() ?? null,
    });
  }

  @OnEvent(ProjectArchivedEvent.EVENT_NAME)
  async onProjectArchived(event: ProjectArchivedEvent): Promise<void> {
    await this.appendProject(event, ActivityType.PROJECT_ARCHIVED, event.actorUserId);
  }

  @OnEvent(ProjectRestoredEvent.EVENT_NAME)
  async onProjectRestored(event: ProjectRestoredEvent): Promise<void> {
    await this.appendProject(event, ActivityType.PROJECT_RESTORED, event.actorUserId);
  }

  @OnEvent(ProjectDeletedEvent.EVENT_NAME)
  async onProjectDeleted(event: ProjectDeletedEvent): Promise<void> {
    await this.appendProject(event, ActivityType.PROJECT_DELETED, event.actorUserId);
  }

  @OnEvent(ProjectMemberAddedEvent.EVENT_NAME)
  async onProjectMemberAdded(event: ProjectMemberAddedEvent): Promise<void> {
    await this.appendProject(event, ActivityType.PROJECT_MEMBER_ADDED, event.actorUserId, {
      memberUserId: event.userId,
      memberDisplayName: await this.displayName(event.userId),
      role: event.role,
    });
  }

  @OnEvent(ProjectMemberRemovedEvent.EVENT_NAME)
  async onProjectMemberRemoved(event: ProjectMemberRemovedEvent): Promise<void> {
    await this.appendProject(event, ActivityType.PROJECT_MEMBER_REMOVED, event.actorUserId, {
      memberUserId: event.userId,
      memberDisplayName: await this.displayName(event.userId),
      role: event.role,
    });
  }

  @OnEvent(ProjectOwnershipTransferredEvent.EVENT_NAME)
  async onProjectOwnershipTransferred(event: ProjectOwnershipTransferredEvent): Promise<void> {
    await this.appendProject(event, ActivityType.PROJECT_OWNERSHIP_TRANSFERRED, event.actorUserId, {
      previousOwnerUserId: event.previousOwnerUserId,
      previousOwnerDisplayName: await this.displayName(event.previousOwnerUserId),
      newOwnerUserId: event.newOwnerUserId,
      newOwnerDisplayName: await this.displayName(event.newOwnerUserId),
    });
  }

  private async appendProject(
    event: { projectId: string; workspaceId: string },
    type: ActivityType,
    actorUserId: string | null,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await this.appendService.append({
      eventName: this.eventName(event, type),
      workspaceId: event.workspaceId,
      projectId: event.projectId,
      actorUserId,
      type,
      subjectType: ActivitySubjectType.PROJECT,
      subjectId: event.projectId,
      metadata,
    });
  }

  private async displayName(userId: string): Promise<string | null> {
    return (await this.profileRepository.findByUserId(userId))?.displayName ?? null;
  }

  private eventName(event: object, fallback: ActivityType): string {
    return (event.constructor as unknown as { EVENT_NAME?: string }).EVENT_NAME ?? fallback;
  }
}
