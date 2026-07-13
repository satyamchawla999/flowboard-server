import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError, ForbiddenError } from '@common/errors';
import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../../domain/contracts/workspace.repository';
import type { Workspace } from '../../domain/models/workspace.model';

@Injectable()
export class WorkspaceAccessService {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
  ) {}

  async getOwnedWorkspaceOrThrow(
    userId: string,
    options: { workspaceId?: string; slug?: string },
  ): Promise<Workspace> {
    let workspace: Workspace | null = null;

    if (options.workspaceId) {
      workspace = await this.workspaceRepository.findById(options.workspaceId);
    } else if (options.slug) {
      workspace = await this.workspaceRepository.findBySlug(options.slug);
    } else {
      throw new Error('Must provide workspace id or slug');
    }

    if (!workspace) {
      throw new EntityNotFoundError('Workspace', options.workspaceId || options.slug || '');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    return workspace;
  }
}
