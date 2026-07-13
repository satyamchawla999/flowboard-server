import { Args, Query, Resolver } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { CurrentUser, type AuthenticatedUser } from '@common/decorators/current-user.decorator';
import {
  IProjectUserProfileRepository,
  PROJECT_USER_PROFILE_REPOSITORY,
} from '@modules/project/domain/contracts/project-user-profile.repository';
import { ActivityConnectionReadModel } from '../../../infrastructure/services/activity-feed.service';
import { ListProjectActivityHandler } from '../../../features/list-project-activity/list-project-activity.handler';
import { ListTaskActivityHandler } from '../../../features/list-task-activity/list-task-activity.handler';
import { ListWorkspaceActivityHandler } from '../../../features/list-workspace-activity/list-workspace-activity.handler';
import {
  ProjectActivityInput,
  TaskActivityInput,
  WorkspaceActivityInput,
} from '../inputs/activity-feed.input';
import {
  ActivityActorGqlModel,
  ActivityConnectionGqlModel,
  ActivityGqlModel,
} from '../models/activity.model';

@Resolver(() => ActivityGqlModel)
export class ActivityResolver {
  constructor(
    private readonly listWorkspaceActivityHandler: ListWorkspaceActivityHandler,
    private readonly listProjectActivityHandler: ListProjectActivityHandler,
    private readonly listTaskActivityHandler: ListTaskActivityHandler,
    @Inject(PROJECT_USER_PROFILE_REPOSITORY)
    private readonly profileRepository: IProjectUserProfileRepository,
  ) {}

  @Query(() => ActivityConnectionGqlModel)
  async workspaceActivity(
    @Args('input') input: WorkspaceActivityInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActivityConnectionGqlModel> {
    return this.toConnectionGql(await this.listWorkspaceActivityHandler.execute(user.id, input));
  }

  @Query(() => ActivityConnectionGqlModel)
  async projectActivity(
    @Args('input') input: ProjectActivityInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActivityConnectionGqlModel> {
    return this.toConnectionGql(await this.listProjectActivityHandler.execute(user.id, input));
  }

  @Query(() => ActivityConnectionGqlModel)
  async taskActivity(
    @Args('input') input: TaskActivityInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActivityConnectionGqlModel> {
    return this.toConnectionGql(await this.listTaskActivityHandler.execute(user.id, input));
  }

  private async toConnectionGql(
    connection: ActivityConnectionReadModel,
  ): Promise<ActivityConnectionGqlModel> {
    const actorIds = [
      ...new Set(
        connection.edges
          .map((edge) => edge.node.actorUserId)
          .filter((actorUserId): actorUserId is string => Boolean(actorUserId)),
      ),
    ];
    const profiles = await this.profileRepository.findByUserIds(actorIds);
    const profileByUserId = new Map(profiles.map((profile) => [profile.userId, profile]));

    return {
      edges: connection.edges.map((edge) => ({
        cursor: edge.cursor,
        node: {
          id: edge.node.id,
          workspaceId: edge.node.workspaceId,
          projectId: edge.node.projectId ?? undefined,
          taskId: edge.node.taskId ?? undefined,
          sectionId: edge.node.sectionId ?? undefined,
          type: edge.node.type,
          subjectType: edge.node.subjectType,
          subjectId: edge.node.subjectId,
          metadata: edge.node.metadata,
          occurredAt: edge.node.occurredAt,
          actor: this.toActor(edge.node.actorUserId, profileByUserId),
        },
      })),
      pageInfo: {
        hasNextPage: connection.pageInfo.hasNextPage,
        endCursor: connection.pageInfo.endCursor ?? undefined,
      },
    };
  }

  private toActor(
    actorUserId: string | null,
    profileByUserId: Map<string, { displayName: string }>,
  ): ActivityActorGqlModel | undefined {
    if (!actorUserId) return undefined;
    const profile = profileByUserId.get(actorUserId);
    return {
      id: actorUserId,
      displayName: profile?.displayName ?? actorUserId,
    };
  }
}
