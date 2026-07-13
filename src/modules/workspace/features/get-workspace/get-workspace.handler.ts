import { Injectable } from '@nestjs/common';
import { WorkspaceAccessService } from '../../infrastructure/services/workspace-access.service';
import type { Workspace } from '../../domain/models/workspace.model';

@Injectable()
export class GetWorkspaceHandler {
  constructor(private readonly workspaceAccess: WorkspaceAccessService) {}

  execute(userId: string, workspaceId?: string, slug?: string): Promise<Workspace> {
    return this.workspaceAccess.getOwnedWorkspaceOrThrow(userId, { workspaceId, slug });
  }
}
