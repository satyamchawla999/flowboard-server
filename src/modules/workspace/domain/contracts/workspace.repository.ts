import type { IBaseRepository } from '@common/base';
import type { Workspace } from '../models/workspace.model';

export interface IWorkspaceRepository extends IBaseRepository<Workspace> {
  findBySlug(slug: string): Promise<Workspace | null>;
  findByOwnerId(ownerId: string): Promise<Workspace[]>;
}

export const WORKSPACE_REPOSITORY = Symbol('IWorkspaceRepository');
