import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  IProjectSectionRepository,
  PROJECT_SECTION_REPOSITORY,
} from '@modules/project/domain/contracts/project-section.repository';
import { ProjectSectionCreatedEvent } from '@modules/project/domain/events/project-section-created.event';
import { ProjectSectionDeletedEvent } from '@modules/project/domain/events/project-section-deleted.event';
import { ProjectSectionRenamedEvent } from '@modules/project/domain/events/project-section-renamed.event';
import { ProjectSectionReorderedEvent } from '@modules/project/domain/events/project-section-reordered.event';
import { ProjectSectionRestoredEvent } from '@modules/project/domain/events/project-section-restored.event';
import { ActivitySubjectType } from '../../domain/value-objects/activity-subject-type.vo';
import { ActivityType } from '../../domain/value-objects/activity-type.vo';
import { ActivityAppendService } from '../services/activity-append.service';

@Injectable()
export class ProjectSectionActivityProjectionListener {
  constructor(
    private readonly appendService: ActivityAppendService,
    @Inject(PROJECT_SECTION_REPOSITORY)
    private readonly sectionRepository: IProjectSectionRepository,
  ) {}

  @OnEvent(ProjectSectionCreatedEvent.EVENT_NAME)
  async onCreated(event: ProjectSectionCreatedEvent): Promise<void> {
    const section = await this.sectionRepository.findByIdIncludingDeleted(event.sectionId);
    await this.appendSection(event, ActivityType.PROJECT_SECTION_CREATED, {
      sectionName: section?.name,
      position: section?.position,
    });
  }

  @OnEvent(ProjectSectionRenamedEvent.EVENT_NAME)
  async onRenamed(event: ProjectSectionRenamedEvent): Promise<void> {
    const section = await this.sectionRepository.findByIdIncludingDeleted(event.sectionId);
    await this.appendSection(event, ActivityType.PROJECT_SECTION_RENAMED, {
      sectionName: section?.name,
      newName: section?.name,
    });
  }

  @OnEvent(ProjectSectionReorderedEvent.EVENT_NAME)
  async onReordered(event: ProjectSectionReorderedEvent): Promise<void> {
    const section = await this.sectionRepository.findByIdIncludingDeleted(event.sectionId);
    await this.appendSection(event, ActivityType.PROJECT_SECTION_REORDERED, {
      sectionName: section?.name,
      previousPosition: event.previousPosition,
      newPosition: event.newPosition,
    });
  }

  @OnEvent(ProjectSectionDeletedEvent.EVENT_NAME)
  async onDeleted(event: ProjectSectionDeletedEvent): Promise<void> {
    const section = await this.sectionRepository.findByIdIncludingDeleted(event.sectionId);
    await this.appendSection(event, ActivityType.PROJECT_SECTION_DELETED, {
      sectionName: section?.name,
    });
  }

  @OnEvent(ProjectSectionRestoredEvent.EVENT_NAME)
  async onRestored(event: ProjectSectionRestoredEvent): Promise<void> {
    const section = await this.sectionRepository.findByIdIncludingDeleted(event.sectionId);
    await this.appendSection(event, ActivityType.PROJECT_SECTION_RESTORED, {
      sectionName: section?.name,
      position: section?.position,
    });
  }

  private async appendSection(
    event: {
      sectionId: string;
      projectId: string;
      workspaceId: string;
      actorUserId: string;
      eventId?: string;
      eventName?: string;
      occurredAt?: Date | string;
    },
    type: ActivityType,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    await this.appendService.append({
      eventName: this.eventName(event, type),
      workspaceId: event.workspaceId,
      projectId: event.projectId,
      sectionId: event.sectionId,
      actorUserId: event.actorUserId,
      type,
      subjectType: ActivitySubjectType.PROJECT_SECTION,
      subjectId: event.sectionId,
      metadata,
      eventId: event.eventId,
      occurredAt: this.occurredAt(event),
    });
  }

  private eventName(event: object, fallback: ActivityType): string {
    return (
      (event as { eventName?: string }).eventName ??
      (event.constructor as unknown as { EVENT_NAME?: string }).EVENT_NAME ??
      fallback
    );
  }

  private occurredAt(event: { occurredAt?: Date | string }): Date | undefined {
    if (event.occurredAt instanceof Date) return event.occurredAt;
    if (typeof event.occurredAt === 'string') {
      const date = new Date(event.occurredAt);
      if (!Number.isNaN(date.getTime())) return date;
    }
    return undefined;
  }
}
