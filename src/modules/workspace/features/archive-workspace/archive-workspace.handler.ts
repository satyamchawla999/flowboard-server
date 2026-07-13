import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { WorkspaceAccessService } from '../../infrastructure/services/workspace-access.service';
import { WorkspaceDomainEventDispatcherService } from '../../infrastructure/services/workspace-domain-event-dispatcher.service';
import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../../domain/contracts/workspace.repository';
import type { Workspace } from '../../domain/models/workspace.model';

@Injectable()
export class ArchiveWorkspaceHandler {
  constructor(
    private readonly workspaceAccess: WorkspaceAccessService,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly eventDispatcher: WorkspaceDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(userId: string, workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspaceAccess.getOwnedWorkspaceOrThrow(userId, {
      workspaceId,
    });

    workspace.archive();
    await this.workspaceRepository.save(workspace);
    this.eventDispatcher.dispatchAggregateEvents(workspace);

    return workspace;
  }
}
