import { BaseDomainModel } from '@common/base';
import { ProjectArchivedEvent } from '../events/project-archived.event';
import { ProjectCreatedEvent } from '../events/project-created.event';
import { ProjectDatesChangedEvent } from '../events/project-dates-changed.event';
import { ProjectDeletedEvent } from '../events/project-deleted.event';
import { ProjectHealthChangedEvent } from '../events/project-health-changed.event';
import { ProjectOwnershipTransferredEvent } from '../events/project-ownership-transferred.event';
import { ProjectRestoredEvent } from '../events/project-restored.event';
import { ProjectUpdatedEvent } from '../events/project-updated.event';
import {
  InvalidProjectDateRangeError,
  ProjectArchivedError,
  ProjectDeletedError,
  ProjectKeyInvalidError,
  ProjectNameInvalidError,
} from '../errors/project.errors';
import { ProjectHealthStatus } from '../value-objects/project-health-status.vo';

interface CreateProjectProps {
  workspaceId: string;
  name: string;
  key: string;
  description?: string | null;
  ownerUserId: string;
  createdByUserId: string;
  startDate?: Date | null;
  dueDate?: Date | null;
}

interface ReconstituteProjectProps extends CreateProjectProps {
  id: string;
  healthStatus: ProjectHealthStatus;
  statusMessage: string | null;
  archivedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Project extends BaseDomainModel {
  workspaceId: string;
  name: string;
  key: string;
  description: string | null;
  ownerUserId: string;
  createdByUserId: string;
  healthStatus: ProjectHealthStatus;
  statusMessage: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  archivedAt: Date | null;
  deletedAt: Date | null;

  private readonly _domainEvents: Array<object> = [];

  private constructor(props: ReconstituteProjectProps) {
    super(props.id);
    this.workspaceId = props.workspaceId;
    this.name = props.name;
    this.key = props.key;
    this.description = props.description ?? null;
    this.ownerUserId = props.ownerUserId;
    this.createdByUserId = props.createdByUserId;
    this.healthStatus = props.healthStatus;
    this.statusMessage = props.statusMessage;
    this.startDate = props.startDate ?? null;
    this.dueDate = props.dueDate ?? null;
    this.archivedAt = props.archivedAt;
    this.deletedAt = props.deletedAt;
    (this as { createdAt: Date }).createdAt = props.createdAt;
    (this as { updatedAt: Date }).updatedAt = props.updatedAt;
  }

  static create(props: CreateProjectProps): Project {
    const name = Project.normalizeName(props.name);
    const key = Project.normalizeKey(props.key);
    Project.validateDateRange(props.startDate ?? null, props.dueDate ?? null);

    const project = new Project({
      id: undefined as unknown as string,
      workspaceId: props.workspaceId,
      name,
      key,
      description: props.description ?? null,
      ownerUserId: props.ownerUserId,
      createdByUserId: props.createdByUserId,
      healthStatus: ProjectHealthStatus.NOT_SET,
      statusMessage: null,
      startDate: props.startDate ?? null,
      dueDate: props.dueDate ?? null,
      archivedAt: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    project._domainEvents.push(
      new ProjectCreatedEvent(
        project.id,
        project.workspaceId,
        project.key,
        project.ownerUserId,
        project.createdByUserId,
      ),
    );

    return project;
  }

  static reconstitute(props: ReconstituteProjectProps): Project {
    return new Project({
      ...props,
      name: Project.normalizeName(props.name),
      key: Project.normalizeKey(props.key),
    });
  }

  static normalizeKey(key: string): string {
    const normalized = key
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    if (!/^[A-Z0-9]{2,12}$/.test(normalized)) {
      throw new ProjectKeyInvalidError();
    }
    return normalized;
  }

  static keyCandidateFromName(name: string): string {
    const words = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    const candidate =
      words.length > 1 ? words.map((word) => word[0]).join('') : (words[0] ?? 'PRJ');

    return Project.normalizeKey((candidate || 'PRJ').slice(0, 8).padEnd(2, 'X'));
  }

  updateDetails(props: { name?: string; description?: string | null }, actorUserId: string): void {
    this.ensureActive();

    let changed = false;
    if (props.name !== undefined) {
      const name = Project.normalizeName(props.name);
      if (this.name !== name) {
        this.name = name;
        changed = true;
      }
    }

    if (props.description !== undefined && this.description !== props.description) {
      this.description = props.description;
      changed = true;
    }

    if (!changed) return;
    this.touch();
    this._domainEvents.push(new ProjectUpdatedEvent(this.id, this.workspaceId, actorUserId));
  }

  updateHealth(
    healthStatus: ProjectHealthStatus,
    statusMessage: string | null | undefined,
    actorUserId: string,
  ): void {
    this.ensureActive();
    const nextMessage = statusMessage === undefined ? this.statusMessage : statusMessage;
    if (this.healthStatus === healthStatus && this.statusMessage === nextMessage) return;

    const previousHealthStatus = this.healthStatus;
    this.healthStatus = healthStatus;
    this.statusMessage = nextMessage ?? null;
    this.touch();
    this._domainEvents.push(
      new ProjectHealthChangedEvent(
        this.id,
        this.workspaceId,
        previousHealthStatus,
        this.healthStatus,
        actorUserId,
      ),
    );
  }

  updateDates(startDate: Date | null, dueDate: Date | null, actorUserId: string): void {
    this.ensureActive();
    Project.validateDateRange(startDate, dueDate);
    if (Project.sameDate(this.startDate, startDate) && Project.sameDate(this.dueDate, dueDate)) {
      return;
    }

    this.startDate = startDate;
    this.dueDate = dueDate;
    this.touch();
    this._domainEvents.push(new ProjectDatesChangedEvent(this.id, this.workspaceId, actorUserId));
  }

  archive(actorUserId: string): void {
    this.ensureNotDeleted();
    if (this.archivedAt) return;

    this.archivedAt = new Date();
    this.touch();
    this._domainEvents.push(new ProjectArchivedEvent(this.id, this.workspaceId, actorUserId));
  }

  restore(actorUserId: string): void {
    this.ensureNotDeleted();
    if (!this.archivedAt) return;

    this.archivedAt = null;
    this.touch();
    this._domainEvents.push(new ProjectRestoredEvent(this.id, this.workspaceId, actorUserId));
  }

  softDelete(actorUserId: string): void {
    this.ensureNotDeleted();
    this.deletedAt = new Date();
    this.touch();
    this._domainEvents.push(new ProjectDeletedEvent(this.id, this.workspaceId, actorUserId));
  }

  transferOwnership(newOwnerUserId: string, actorUserId: string): void {
    this.ensureActive();
    if (this.ownerUserId === newOwnerUserId) return;
    const previousOwnerUserId = this.ownerUserId;
    this.ownerUserId = newOwnerUserId;
    this.touch();
    this._domainEvents.push(
      new ProjectOwnershipTransferredEvent(
        this.id,
        this.workspaceId,
        previousOwnerUserId,
        this.ownerUserId,
        actorUserId,
      ),
    );
  }

  get isArchived(): boolean {
    return Boolean(this.archivedAt);
  }

  get isDeleted(): boolean {
    return Boolean(this.deletedAt);
  }

  pullDomainEvents(): object[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }

  private ensureActive(): void {
    this.ensureNotDeleted();
    if (this.archivedAt) throw new ProjectArchivedError(this.id);
  }

  private ensureNotDeleted(): void {
    if (this.deletedAt) throw new ProjectDeletedError(this.id);
  }

  private static normalizeName(name: string): string {
    const normalized = name.trim();
    if (normalized.length < 3 || normalized.length > 120) {
      throw new ProjectNameInvalidError();
    }
    return normalized;
  }

  private static validateDateRange(startDate: Date | null, dueDate: Date | null): void {
    if (startDate && dueDate && startDate.getTime() > dueDate.getTime()) {
      throw new InvalidProjectDateRangeError();
    }
  }

  private static sameDate(left: Date | null, right: Date | null): boolean {
    return (left?.getTime() ?? null) === (right?.getTime() ?? null);
  }
}
