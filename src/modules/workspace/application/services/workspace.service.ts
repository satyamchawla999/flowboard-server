import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { EntityNotFoundError, ForbiddenError } from '@common/errors';

import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../../domain/contracts/workspace.repository';
import {
  IWorkspaceUserProfileRepository,
  WORKSPACE_USER_PROFILE_REPOSITORY,
} from '../../domain/contracts/workspace-user-profile.repository';
import { Workspace } from '../../domain/models/workspace.model';
import { SlugAlreadyExistsError } from '../../domain/errors/workspace.errors';
import type { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import type { UpdateWorkspaceDto } from '../dto/update-workspace.dto';
import type { UpdatePreferencesDto } from '../dto/update-preferences.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(WORKSPACE_USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IWorkspaceUserProfileRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createWorkspace(userId: string, dto: CreateWorkspaceDto): Promise<Workspace> {
    const userProfile = await this.userProfileRepository.findByUserId(userId);
    if (!userProfile) {
      throw new EntityNotFoundError('WorkspaceUserProfile', userId);
    }

    if (!userProfile.canCreateWorkspace()) {
      throw new ForbiddenError('Suspended users cannot create workspaces');
    }

    // 1. Workspace slug must be unique
    const slug = Workspace.generateSlug(dto.name);
    const existing = await this.workspaceRepository.findBySlug(slug);
    if (existing) {
      throw new SlugAlreadyExistsError(slug);
    }

    const workspace = Workspace.create({
      name: dto.name,
      ownerId: userId,
      description: dto.description,
      logo: dto.logo,
      timezone: dto.timezone ?? 'UTC',
    });

    await this.workspaceRepository.save(workspace);
    this.dispatchEvents(workspace);

    return workspace;
  }

  async getWorkspace(userId: string, workspaceId?: string, slug?: string): Promise<Workspace> {
    let workspace: Workspace | null = null;
    if (workspaceId) {
      workspace = await this.workspaceRepository.findById(workspaceId);
    } else if (slug) {
      workspace = await this.workspaceRepository.findBySlug(slug);
    } else {
      throw new Error('Must provide workspace id or slug');
    }

    if (!workspace) {
      throw new EntityNotFoundError('Workspace', workspaceId || slug || '');
    }

    // 8. Users can only access their own workspaces
    if (workspace.ownerId !== userId) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    return workspace;
  }

  async listMyWorkspaces(userId: string): Promise<Workspace[]> {
    return this.workspaceRepository.findByOwnerId(userId);
  }

  async updateWorkspace(
    userId: string,
    workspaceId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    const workspace = await this.getWorkspace(userId, workspaceId);

    workspace.updateDetails({
      name: dto.name,
      description: dto.description,
      logo: dto.logo,
      timezone: dto.timezone,
    });

    await this.workspaceRepository.save(workspace);
    this.dispatchEvents(workspace);

    return workspace;
  }

  async updatePreferences(
    userId: string,
    workspaceId: string,
    dto: UpdatePreferencesDto,
  ): Promise<Workspace> {
    const workspace = await this.getWorkspace(userId, workspaceId);

    const updatedPreferences = workspace.preferences.update({
      defaultTaskView: dto.defaultTaskView,
      defaultTimezone: dto.defaultTimezone,
      notificationSettings: dto.notificationSettings,
      automationRules: dto.automationRules,
      customStatuses: dto.customStatuses,
    });

    workspace.updatePreferences(updatedPreferences);

    await this.workspaceRepository.save(workspace);
    this.dispatchEvents(workspace);

    return workspace;
  }

  async archiveWorkspace(userId: string, workspaceId: string): Promise<Workspace> {
    const workspace = await this.getWorkspace(userId, workspaceId);

    workspace.archive();

    await this.workspaceRepository.save(workspace);
    this.dispatchEvents(workspace);

    return workspace;
  }

  async restoreWorkspace(userId: string, workspaceId: string): Promise<Workspace> {
    const workspace = await this.getWorkspace(userId, workspaceId);

    workspace.restore();

    await this.workspaceRepository.save(workspace);
    this.dispatchEvents(workspace);

    return workspace;
  }

  async softDeleteWorkspace(userId: string, workspaceId: string): Promise<void> {
    const workspace = await this.getWorkspace(userId, workspaceId);

    workspace.softDelete();

    await this.workspaceRepository.save(workspace);
    this.dispatchEvents(workspace);
  }

  private dispatchEvents(aggregate: Workspace): void {
    const events = aggregate.pullDomainEvents();
    for (const event of events) {
      const eventName = (event.constructor as { EVENT_NAME?: string }).EVENT_NAME;
      if (eventName) {
        this.eventEmitter.emit(eventName, event);
      }
    }
  }
}
