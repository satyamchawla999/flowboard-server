import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from '@common/decorators/current-user.decorator';
import {
  IProjectMemberRepository,
  PROJECT_MEMBER_REPOSITORY,
} from '../../../domain/contracts/project-member.repository';
import {
  IProjectUserProfileRepository,
  PROJECT_USER_PROFILE_REPOSITORY,
} from '../../../domain/contracts/project-user-profile.repository';
import { Project } from '../../../domain/models/project.model';
import { ProjectMember } from '../../../domain/models/project-member.model';
import { CreateProjectHandler } from '../../../features/create-project/create-project.handler';
import { GetProjectHandler } from '../../../features/get-project/get-project.handler';
import { ListWorkspaceProjectsHandler } from '../../../features/list-workspace-projects/list-workspace-projects.handler';
import { UpdateProjectDetailsHandler } from '../../../features/update-project-details/update-project-details.handler';
import { UpdateProjectHealthHandler } from '../../../features/update-project-health/update-project-health.handler';
import { UpdateProjectDatesHandler } from '../../../features/update-project-dates/update-project-dates.handler';
import { ArchiveProjectHandler } from '../../../features/archive-project/archive-project.handler';
import { RestoreProjectHandler } from '../../../features/restore-project/restore-project.handler';
import { DeleteProjectHandler } from '../../../features/delete-project/delete-project.handler';
import { ListProjectMembersHandler } from '../../../features/list-project-members/list-project-members.handler';
import { AddProjectMemberHandler } from '../../../features/add-project-member/add-project-member.handler';
import { RemoveProjectMemberHandler } from '../../../features/remove-project-member/remove-project-member.handler';
import { TransferProjectOwnershipHandler } from '../../../features/transfer-project-ownership/transfer-project-ownership.handler';
import { AddProjectMemberInput } from '../inputs/add-project-member.input';
import { CreateProjectInput } from '../inputs/create-project.input';
import { ListWorkspaceProjectsInput } from '../inputs/list-workspace-projects.input';
import { RemoveProjectMemberInput } from '../inputs/remove-project-member.input';
import { TransferProjectOwnershipInput } from '../inputs/transfer-project-ownership.input';
import { UpdateProjectDatesInput } from '../inputs/update-project-dates.input';
import { UpdateProjectDetailsInput } from '../inputs/update-project-details.input';
import { UpdateProjectHealthInput } from '../inputs/update-project-health.input';
import { ProjectGqlModel } from '../models/project.model';
import { ProjectMemberGqlModel, ProjectUserGqlModel } from '../models/project-member.model';

@Resolver(() => ProjectGqlModel)
export class ProjectResolver {
  constructor(
    private readonly createProjectHandler: CreateProjectHandler,
    private readonly getProjectHandler: GetProjectHandler,
    private readonly listWorkspaceProjectsHandler: ListWorkspaceProjectsHandler,
    private readonly updateProjectDetailsHandler: UpdateProjectDetailsHandler,
    private readonly updateProjectHealthHandler: UpdateProjectHealthHandler,
    private readonly updateProjectDatesHandler: UpdateProjectDatesHandler,
    private readonly archiveProjectHandler: ArchiveProjectHandler,
    private readonly restoreProjectHandler: RestoreProjectHandler,
    private readonly deleteProjectHandler: DeleteProjectHandler,
    private readonly listProjectMembersHandler: ListProjectMembersHandler,
    private readonly addProjectMemberHandler: AddProjectMemberHandler,
    private readonly removeProjectMemberHandler: RemoveProjectMemberHandler,
    private readonly transferProjectOwnershipHandler: TransferProjectOwnershipHandler,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    @Inject(PROJECT_USER_PROFILE_REPOSITORY)
    private readonly projectUserProfileRepository: IProjectUserProfileRepository,
  ) {}

  @Query(() => ProjectGqlModel)
  async project(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectGqlModel> {
    const project = await this.getProjectHandler.execute(user.id, { id });
    return this.toProjectGql(project, true);
  }

  @Query(() => ProjectGqlModel)
  async projectByKey(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('key') key: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectGqlModel> {
    const project = await this.getProjectHandler.execute(user.id, { workspaceId, key });
    return this.toProjectGql(project, true);
  }

  @Query(() => [ProjectGqlModel])
  async workspaceProjects(
    @Args('input') input: ListWorkspaceProjectsInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectGqlModel[]> {
    const projects = await this.listWorkspaceProjectsHandler.execute(user.id, {
      workspaceId: input.workspaceId,
      includeArchived: input.includeArchived,
      search: input.search,
    });
    return Promise.all(projects.map((project) => this.toProjectGql(project)));
  }

  @Query(() => [ProjectMemberGqlModel])
  async projectMembers(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectMemberGqlModel[]> {
    const members = await this.listProjectMembersHandler.execute(user.id, projectId);
    return this.toMembersGql(members);
  }

  @Mutation(() => ProjectGqlModel)
  async createProject(
    @Args('input') input: CreateProjectInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectGqlModel> {
    const project = await this.createProjectHandler.execute(user.id, input);
    return this.toProjectGql(project, true);
  }

  @Mutation(() => ProjectGqlModel)
  async updateProjectDetails(
    @Args('input') input: UpdateProjectDetailsInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectGqlModel> {
    const project = await this.updateProjectDetailsHandler.execute(user.id, input);
    return this.toProjectGql(project, true);
  }

  @Mutation(() => ProjectGqlModel)
  async updateProjectHealth(
    @Args('input') input: UpdateProjectHealthInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectGqlModel> {
    const project = await this.updateProjectHealthHandler.execute(user.id, input);
    return this.toProjectGql(project, true);
  }

  @Mutation(() => ProjectGqlModel)
  async updateProjectDates(
    @Args('input') input: UpdateProjectDatesInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectGqlModel> {
    const project = await this.updateProjectDatesHandler.execute(user.id, input);
    return this.toProjectGql(project, true);
  }

  @Mutation(() => ProjectGqlModel)
  async archiveProject(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectGqlModel> {
    const project = await this.archiveProjectHandler.execute(user.id, projectId);
    return this.toProjectGql(project, true);
  }

  @Mutation(() => ProjectGqlModel)
  async restoreProject(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectGqlModel> {
    const project = await this.restoreProjectHandler.execute(user.id, projectId);
    return this.toProjectGql(project, true);
  }

  @Mutation(() => Boolean)
  async deleteProject(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.deleteProjectHandler.execute(user.id, projectId);
    return true;
  }

  @Mutation(() => ProjectMemberGqlModel)
  async addProjectMember(
    @Args('input') input: AddProjectMemberInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectMemberGqlModel> {
    const member = await this.addProjectMemberHandler.execute(user.id, input);
    return this.toMemberGql(member);
  }

  @Mutation(() => Boolean)
  async removeProjectMember(
    @Args('input') input: RemoveProjectMemberInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.removeProjectMemberHandler.execute(user.id, input);
    return true;
  }

  @Mutation(() => ProjectGqlModel)
  async transferProjectOwnership(
    @Args('input') input: TransferProjectOwnershipInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProjectGqlModel> {
    const project = await this.transferProjectOwnershipHandler.execute(user.id, input);
    return this.toProjectGql(project, true);
  }

  private async toProjectGql(project: Project, includeMembers = false): Promise<ProjectGqlModel> {
    const model = new ProjectGqlModel();
    model.id = project.id;
    model.workspaceId = project.workspaceId;
    model.name = project.name;
    model.key = project.key;
    model.description = project.description ?? undefined;
    model.ownerUserId = project.ownerUserId;
    model.createdByUserId = project.createdByUserId;
    model.healthStatus = project.healthStatus;
    model.statusMessage = project.statusMessage ?? undefined;
    model.startDate = project.startDate ?? undefined;
    model.dueDate = project.dueDate ?? undefined;
    model.isArchived = project.isArchived;
    model.createdAt = project.createdAt;
    model.updatedAt = project.updatedAt;
    model.owner = await this.toUserGql(project.ownerUserId);
    model.members = includeMembers
      ? await this.toMembersGql(await this.projectMemberRepository.listByProject(project.id))
      : [];
    return model;
  }

  private async toMembersGql(members: ProjectMember[]): Promise<ProjectMemberGqlModel[]> {
    return Promise.all(members.map((member) => this.toMemberGql(member)));
  }

  private async toMemberGql(member: ProjectMember): Promise<ProjectMemberGqlModel> {
    const model = new ProjectMemberGqlModel();
    model.id = member.id;
    model.workspaceId = member.workspaceId;
    model.projectId = member.projectId;
    model.userId = member.userId;
    model.role = member.role;
    model.joinedAt = member.joinedAt;
    model.createdAt = member.createdAt;
    model.updatedAt = member.updatedAt;
    model.user = await this.toUserGql(member.userId);
    return model;
  }

  private async toUserGql(userId: string): Promise<ProjectUserGqlModel | undefined> {
    const profile = await this.projectUserProfileRepository.findByUserId(userId);
    if (!profile) return undefined;

    const model = new ProjectUserGqlModel();
    model.id = profile.userId;
    model.email = profile.email;
    model.displayName = profile.displayName;
    return model;
  }
}
