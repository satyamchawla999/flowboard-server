import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { WorkspaceAccessService } from '../../infrastructure/services/workspace-access.service';
import { WorkspaceDomainEventDispatcherService } from '../../infrastructure/services/workspace-domain-event-dispatcher.service';
import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../../domain/contracts/workspace.repository';
import type { Workspace } from '../../domain/models/workspace.model';
import type { UpdateWorkspaceDto } from './update-workspace.dto';

@Injectable()
export class UpdateWorkspaceHandler {
  constructor(
    private readonly workspaceAccess: WorkspaceAccessService,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly eventDispatcher: WorkspaceDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(userId: string, workspaceId: string, dto: UpdateWorkspaceDto): Promise<Workspace> {
    const workspace = await this.workspaceAccess.getOwnedWorkspaceOrThrow(userId, {
      workspaceId,
    });

    workspace.updateDetails({
      name: dto.name,
      description: dto.description,
      logo: dto.logo,
      timezone: dto.timezone,
    });

    await this.workspaceRepository.save(workspace);
    this.eventDispatcher.dispatchAggregateEvents(workspace);

    return workspace;
  }
}
