import { Inject, Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { WorkspaceAccessService } from '../../infrastructure/services/workspace-access.service';
import { WorkspaceDomainEventDispatcherService } from '../../infrastructure/services/workspace-domain-event-dispatcher.service';
import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../../domain/contracts/workspace.repository';
import type { Workspace } from '../../domain/models/workspace.model';
import type { UpdateWorkspacePreferencesDto } from './update-workspace-preferences.dto';

@Injectable()
export class UpdateWorkspacePreferencesHandler {
  constructor(
    private readonly workspaceAccess: WorkspaceAccessService,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly eventDispatcher: WorkspaceDomainEventDispatcherService,
  ) {}

  @Transactional()
  async execute(
    userId: string,
    workspaceId: string,
    dto: UpdateWorkspacePreferencesDto,
  ): Promise<Workspace> {
    const workspace = await this.workspaceAccess.getOwnedWorkspaceOrThrow(userId, {
      workspaceId,
    });

    const updatedPreferences = workspace.preferences.update({
      defaultTaskView: dto.defaultTaskView,
      defaultTimezone: dto.defaultTimezone,
      notificationSettings: dto.notificationSettings,
      automationRules: dto.automationRules,
      customStatuses: dto.customStatuses,
    });

    workspace.updatePreferences(updatedPreferences);

    await this.workspaceRepository.save(workspace);
    this.eventDispatcher.dispatchAggregateEvents(workspace);

    return workspace;
  }
}
