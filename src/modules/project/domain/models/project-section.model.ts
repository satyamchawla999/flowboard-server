import { BaseDomainModel } from '@common/base';
import { ProjectSectionCreatedEvent } from '../events/project-section-created.event';
import { ProjectSectionDeletedEvent } from '../events/project-section-deleted.event';
import { ProjectSectionRenamedEvent } from '../events/project-section-renamed.event';
import { ProjectSectionReorderedEvent } from '../events/project-section-reordered.event';
import { ProjectSectionRestoredEvent } from '../events/project-section-restored.event';
import {
  InvalidProjectSectionPositionError,
  ProjectSectionDeletedError,
  ProjectSectionNameInvalidError,
} from '../errors/project-section.errors';

interface CreateProjectSectionProps {
  workspaceId: string;
  projectId: string;
  name: string;
  position: number;
  actorUserId: string;
}

interface ReconstituteProjectSectionProps extends Omit<CreateProjectSectionProps, 'actorUserId'> {
  id: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectSection extends BaseDomainModel {
  workspaceId: string;
  projectId: string;
  name: string;
  position: number;
  deletedAt: Date | null;

  private readonly _domainEvents: Array<object> = [];

  private constructor(props: ReconstituteProjectSectionProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.projectId = props.projectId;
    this.name = ProjectSection.normalizeName(props.name);
    this.position = ProjectSection.normalizePosition(props.position);
    this.deletedAt = props.deletedAt;
    (this as { createdAt: Date }).createdAt = props.createdAt;
    (this as { updatedAt: Date }).updatedAt = props.updatedAt;
  }

  static create(props: CreateProjectSectionProps): ProjectSection {
    const section = new ProjectSection({
      id: undefined as unknown as string,
      workspaceId: props.workspaceId,
      projectId: props.projectId,
      name: props.name,
      position: props.position,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    section._domainEvents.push(
      new ProjectSectionCreatedEvent(
        section.id,
        section.projectId,
        section.workspaceId,
        props.actorUserId,
      ),
    );

    return section;
  }

  static reconstitute(props: ReconstituteProjectSectionProps): ProjectSection {
    return new ProjectSection(props);
  }

  rename(name: string, actorUserId: string): void {
    this.ensureNotDeleted();
    const normalized = ProjectSection.normalizeName(name);
    if (this.name === normalized) return;

    this.name = normalized;
    this.touch();
    this._domainEvents.push(
      new ProjectSectionRenamedEvent(this.id, this.projectId, this.workspaceId, actorUserId),
    );
  }

  moveTo(position: number, actorUserId: string): void {
    this.ensureNotDeleted();
    const normalized = ProjectSection.normalizePosition(position);
    if (this.position === normalized) return;

    const previousPosition = this.position;
    this.position = normalized;
    this.touch();
    this._domainEvents.push(
      new ProjectSectionReorderedEvent(
        this.id,
        this.projectId,
        this.workspaceId,
        actorUserId,
        previousPosition,
        this.position,
      ),
    );
  }

  softDelete(actorUserId: string): void {
    this.ensureNotDeleted();
    this.deletedAt = new Date();
    this.touch();
    this._domainEvents.push(
      new ProjectSectionDeletedEvent(this.id, this.projectId, this.workspaceId, actorUserId),
    );
  }

  restore(position: number, actorUserId: string): void {
    if (!this.deletedAt) return;
    this.deletedAt = null;
    this.position = ProjectSection.normalizePosition(position);
    this.touch();
    this._domainEvents.push(
      new ProjectSectionRestoredEvent(this.id, this.projectId, this.workspaceId, actorUserId),
    );
  }

  get isDeleted(): boolean {
    return Boolean(this.deletedAt);
  }

  pullDomainEvents(): object[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }

  static normalizeName(name: string): string {
    const normalized = name.trim();
    if (!normalized || normalized.length > 100) {
      throw new ProjectSectionNameInvalidError();
    }
    return normalized;
  }

  private ensureNotDeleted(): void {
    if (this.deletedAt) throw new ProjectSectionDeletedError(this.id);
  }

  private static normalizePosition(position: number): number {
    if (!Number.isFinite(position) || position <= 0) {
      throw new InvalidProjectSectionPositionError();
    }
    return Number(position);
  }
}
