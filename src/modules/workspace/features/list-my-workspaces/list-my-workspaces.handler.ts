import { Inject, Injectable } from '@nestjs/common';
import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../../domain/contracts/workspace.repository';
import type { Workspace } from '../../domain/models/workspace.model';

@Injectable()
export class ListMyWorkspacesHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
  ) {}

  execute(userId: string): Promise<Workspace[]> {
    return this.workspaceRepository.findByOwnerId(userId);
  }
}
