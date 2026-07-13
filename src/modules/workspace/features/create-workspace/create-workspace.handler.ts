import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
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
import { WorkspaceDomainEventDispatcherService } from '../../infrastructure/services/workspace-domain-event-dispatcher.service';
import type { CreateWorkspaceDto } from './create-workspace.dto';

@Injectable()
export class CreateWorkspaceHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(WORKSPACE_USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: IWorkspaceUserProfileRepository,
    private readonly eventDispatcher: WorkspaceDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(userId: string, dto: CreateWorkspaceDto): Promise<Workspace> {
    const userProfile = await this.userProfileRepository.findByUserId(userId);
    if (!userProfile) {
      throw new EntityNotFoundError('WorkspaceUserProfile', userId);
    }

    if (!userProfile.canCreateWorkspace()) {
      throw new ForbiddenError('Suspended users cannot create workspaces');
    }

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
    this.eventDispatcher.dispatchAggregateEvents(workspace);

    return workspace;
  }
}
