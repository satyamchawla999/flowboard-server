import { BaseDomainModel } from '@common/base';
import { WorkspacePreferences } from '../value-objects/workspace-preferences.vo';
import { WorkspaceCreatedEvent } from '../events/workspace-created.event';
import { WorkspaceUpdatedEvent } from '../events/workspace-updated.event';
import { WorkspaceArchivedEvent } from '../events/workspace-archived.event';
import {
  InvalidWorkspaceNameError,
  WorkspaceArchivedError,
  WorkspaceDeletedError,
} from '../errors/workspace.errors';

interface CreateWorkspaceProps {
  name: string;
  ownerId: string;
  description?: string | null;
  logo?: string | null;
  timezone?: string;
  preferences?: WorkspacePreferences;
}

interface ReconstituteWorkspaceProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  timezone: string;
  ownerId: string;
  isArchived: boolean;
  isDeleted: boolean;
  preferences: WorkspacePreferences;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workspace Aggregate Root.
 * Manages the workspace lifecycle, settings, metadata, and preferences.
 */
export class Workspace extends BaseDomainModel {
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  timezone: string;
  ownerId: string;
  isArchived: boolean;
  isDeleted: boolean;
  preferences: WorkspacePreferences;

  private readonly _domainEvents: Array<object> = [];

  private constructor(props: ReconstituteWorkspaceProps) {
    super(props.id);
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.logo = props.logo;
    this.timezone = props.timezone;
    this.ownerId = props.ownerId;
    this.isArchived = props.isArchived;
    this.isDeleted = props.isDeleted;
    this.preferences = props.preferences;
    (this as { createdAt: Date }).createdAt = props.createdAt;
    (this as { updatedAt: Date }).updatedAt = props.updatedAt;
  }

  static create(props: CreateWorkspaceProps): Workspace {
    Workspace.validateName(props.name);

    const slug = Workspace.generateSlug(props.name);
    const workspace = new Workspace({
      id: undefined as unknown as string,
      name: props.name,
      slug,
      description: props.description ?? null,
      logo: props.logo ?? null,
      timezone: props.timezone ?? 'UTC',
      ownerId: props.ownerId,
      isArchived: false,
      isDeleted: false,
      preferences:
        props.preferences ??
        WorkspacePreferences.create({ defaultTimezone: props.timezone ?? 'UTC' }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    workspace._domainEvents.push(
      new WorkspaceCreatedEvent(workspace.id, workspace.name, workspace.slug, workspace.ownerId),
    );

    return workspace;
  }

  static reconstitute(props: ReconstituteWorkspaceProps): Workspace {
    return new Workspace(props);
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length < 3 || name.trim().length > 100) {
      throw new InvalidWorkspaceNameError('Workspace name must be between 3 and 100 characters');
    }
  }

  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove non-word characters
      .replace(/[\s_-]+/g, '-') // replace spaces, underscores, and hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
  }

  updateDetails(props: {
    name?: string;
    description?: string | null;
    logo?: string | null;
    timezone?: string;
  }): void {
    this.checkIfArchived();
    this.checkIfDeleted();

    if (props.name !== undefined) {
      Workspace.validateName(props.name);
      this.name = props.name;
    }
    if (props.description !== undefined) {
      this.description = props.description;
    }
    if (props.logo !== undefined) {
      this.logo = props.logo;
    }
    if (props.timezone !== undefined) {
      this.timezone = props.timezone;
    }

    this.touch();
    this._domainEvents.push(new WorkspaceUpdatedEvent(this.id, this.name, this.slug));
  }

  updatePreferences(preferences: WorkspacePreferences): void {
    this.checkIfArchived();
    this.checkIfDeleted();
    this.preferences = preferences;
    this.touch();
    this._domainEvents.push(new WorkspaceUpdatedEvent(this.id, this.name, this.slug));
  }

  archive(): void {
    this.checkIfDeleted();
    if (this.isArchived) return;

    this.isArchived = true;
    this.touch();
    this._domainEvents.push(new WorkspaceArchivedEvent(this.id));
  }

  restore(): void {
    this.checkIfDeleted();
    if (!this.isArchived) return;

    this.isArchived = false;
    this.touch();
    this._domainEvents.push(new WorkspaceUpdatedEvent(this.id, this.name, this.slug));
  }

  softDelete(): void {
    this.checkIfDeleted();
    this.isDeleted = true;
    this.touch();
  }

  private checkIfArchived(): void {
    if (this.isArchived) {
      throw new WorkspaceArchivedError(this.id);
    }
  }

  private checkIfDeleted(): void {
    if (this.isDeleted) {
      throw new WorkspaceDeletedError(this.id);
    }
  }

  pullDomainEvents(): object[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }
}
