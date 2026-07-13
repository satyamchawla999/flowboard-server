import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CurrentUser, type AuthenticatedUser } from '@common/decorators/current-user.decorator';
import { CreateWorkspaceHandler } from '../../../features/create-workspace/create-workspace.handler';
import { GetWorkspaceHandler } from '../../../features/get-workspace/get-workspace.handler';
import { ListMyWorkspacesHandler } from '../../../features/list-my-workspaces/list-my-workspaces.handler';
import { UpdateWorkspaceHandler } from '../../../features/update-workspace/update-workspace.handler';
import { UpdateWorkspacePreferencesHandler } from '../../../features/update-workspace-preferences/update-workspace-preferences.handler';
import { ArchiveWorkspaceHandler } from '../../../features/archive-workspace/archive-workspace.handler';
import { RestoreWorkspaceHandler } from '../../../features/restore-workspace/restore-workspace.handler';
import { DeleteWorkspaceHandler } from '../../../features/delete-workspace/delete-workspace.handler';
import { WorkspaceGqlModel } from '../models/workspace.model';
import { WorkspacePreferencesGqlModel } from '../models/workspace-preferences.model';
import { CreateWorkspaceInput } from '../inputs/create-workspace.input';
import { UpdateWorkspaceInput } from '../inputs/update-workspace.input';
import { UpdatePreferencesInput } from '../inputs/update-preferences.input';
import { Workspace } from '../../../domain/models/workspace.model';

/**
 * GraphQL Resolver for Workspace aggregate.
 * Thin presentation layer containing mapping and validation checks.
 */
@Resolver(() => WorkspaceGqlModel)
export class WorkspaceResolver {
  constructor(
    private readonly createWorkspaceHandler: CreateWorkspaceHandler,
    private readonly getWorkspaceHandler: GetWorkspaceHandler,
    private readonly listMyWorkspacesHandler: ListMyWorkspacesHandler,
    private readonly updateWorkspaceHandler: UpdateWorkspaceHandler,
    private readonly updateWorkspacePreferencesHandler: UpdateWorkspacePreferencesHandler,
    private readonly archiveWorkspaceHandler: ArchiveWorkspaceHandler,
    private readonly restoreWorkspaceHandler: RestoreWorkspaceHandler,
    private readonly deleteWorkspaceHandler: DeleteWorkspaceHandler,
  ) {}

  @Query(() => WorkspaceGqlModel, { name: 'workspace' })
  async getWorkspace(
    @Args('id', { type: () => ID, nullable: true }) id: string | undefined,
    @Args('slug', { type: () => String, nullable: true }) slug: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceGqlModel> {
    const workspace = await this.getWorkspaceHandler.execute(user.id, id, slug);
    return this.toGql(workspace);
  }

  @Query(() => [WorkspaceGqlModel], { name: 'myWorkspaces' })
  async getMyWorkspaces(@CurrentUser() user: AuthenticatedUser): Promise<WorkspaceGqlModel[]> {
    const workspaces = await this.listMyWorkspacesHandler.execute(user.id);
    return workspaces.map((w) => this.toGql(w));
  }

  @Mutation(() => WorkspaceGqlModel)
  async createWorkspace(
    @Args('input') input: CreateWorkspaceInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceGqlModel> {
    const workspace = await this.createWorkspaceHandler.execute(user.id, {
      name: input.name,
      ownerId: user.id,
      description: input.description,
      logo: input.logo,
      timezone: input.timezone,
    });
    return this.toGql(workspace);
  }

  @Mutation(() => WorkspaceGqlModel)
  async updateWorkspace(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateWorkspaceInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceGqlModel> {
    const workspace = await this.updateWorkspaceHandler.execute(user.id, id, {
      name: input.name,
      description: input.description,
      logo: input.logo,
      timezone: input.timezone,
    });
    return this.toGql(workspace);
  }

  @Mutation(() => WorkspaceGqlModel)
  async updateWorkspacePreferences(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePreferencesInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceGqlModel> {
    const workspace = await this.updateWorkspacePreferencesHandler.execute(user.id, id, {
      defaultTaskView: input.defaultTaskView,
      defaultTimezone: input.defaultTimezone,
      notificationSettings: input.notificationSettings,
      automationRules: input.automationRules,
      customStatuses: input.customStatuses,
    });
    return this.toGql(workspace);
  }

  @Mutation(() => WorkspaceGqlModel)
  async archiveWorkspace(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceGqlModel> {
    const workspace = await this.archiveWorkspaceHandler.execute(user.id, id);
    return this.toGql(workspace);
  }

  @Mutation(() => WorkspaceGqlModel)
  async restoreWorkspace(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkspaceGqlModel> {
    const workspace = await this.restoreWorkspaceHandler.execute(user.id, id);
    return this.toGql(workspace);
  }

  @Mutation(() => Boolean)
  async deleteWorkspace(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.deleteWorkspaceHandler.execute(user.id, id);
    return true;
  }

  private toGql(workspace: Workspace): WorkspaceGqlModel {
    const model = new WorkspaceGqlModel();
    model.id = workspace.id;
    model.name = workspace.name;
    model.slug = workspace.slug;
    model.description = workspace.description ?? undefined;
    model.logo = workspace.logo ?? undefined;
    model.timezone = workspace.timezone;
    model.ownerId = workspace.ownerId;
    model.isArchived = workspace.isArchived;

    const prefs = new WorkspacePreferencesGqlModel();
    prefs.defaultTaskView = workspace.preferences.defaultTaskView;
    prefs.defaultTimezone = workspace.preferences.defaultTimezone;
    prefs.notificationSettings = workspace.preferences.notificationSettings ?? undefined;
    prefs.automationRules = workspace.preferences.automationRules ?? undefined;
    prefs.customStatuses = workspace.preferences.customStatuses ?? undefined;

    model.preferences = prefs;
    model.createdAt = workspace.createdAt;
    model.updatedAt = workspace.updatedAt;
    return model;
  }
}
