import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { WorkspaceAccessService } from '../../infrastructure/services/workspace-access.service';
import { WorkspaceDomainEventDispatcherService } from '../../infrastructure/services/workspace-domain-event-dispatcher.service';
import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../../domain/contracts/workspace.repository';

@Injectable()
export class DeleteWorkspaceHandler {
  constructor(
    private readonly workspaceAccess: WorkspaceAccessService,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly eventDispatcher: WorkspaceDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(userId: string, workspaceId: string): Promise<void> {
    const workspace = await this.workspaceAccess.getOwnedWorkspaceOrThrow(userId, {
      workspaceId,
    });

    workspace.softDelete();
    await this.workspaceRepository.save(workspace);
    this.eventDispatcher.dispatchAggregateEvents(workspace);
  }
}
