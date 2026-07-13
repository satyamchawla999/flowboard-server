import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CurrentUser, type AuthenticatedUser } from '@common/decorators/current-user.decorator';
import { GetMeHandler } from '../../../../features/get-me/get-me.handler';
import { UpdateProfileHandler } from '../../../../features/update-profile/update-profile.handler';
import { ListActiveSessionsHandler } from '../../../../features/list-active-sessions/list-active-sessions.handler';
import { RevokeSessionHandler } from '../../../../features/revoke-session/revoke-session.handler';
import { LogoutAllDevicesHandler } from '../../../../features/logout-all-devices/logout-all-devices.handler';
import { SendVerificationEmailHandler } from '../../../../features/send-verification-email/send-verification-email.handler';
import { UserGqlModel } from '../models/user.model';
import { SessionGqlModel } from '../models/session.model';
import { UpdateProfileInput } from '../inputs/update-profile.input';
import type { User } from '../../../../domain/models/user.model';
import type { Session } from '../../../../domain/models/session.model';

@Resolver(() => UserGqlModel)
export class UserResolver {
  constructor(
    private readonly getMeHandler: GetMeHandler,
    private readonly updateProfileHandler: UpdateProfileHandler,
    private readonly listActiveSessionsHandler: ListActiveSessionsHandler,
    private readonly revokeSessionHandler: RevokeSessionHandler,
    private readonly logoutAllDevicesHandler: LogoutAllDevicesHandler,
    private readonly sendVerificationEmailHandler: SendVerificationEmailHandler,
  ) {}

  @Query(() => UserGqlModel, { name: 'me' })
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<UserGqlModel> {
    const result = await this.getMeHandler.execute(user.id);
    return this.toGql(result);
  }

  @Mutation(() => UserGqlModel)
  async updateProfile(
    @Args('input') input: UpdateProfileInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserGqlModel> {
    const result = await this.updateProfileHandler.execute(user.id, {
      displayName: input.displayName,
      timezone: input.timezone,
    });
    return this.toGql(result);
  }

  @Query(() => [SessionGqlModel], { name: 'activeSessions' })
  async listActiveSessions(@CurrentUser() user: AuthenticatedUser): Promise<SessionGqlModel[]> {
    const sessions = await this.listActiveSessionsHandler.execute(user.id);
    return sessions.map((s) => this.sessionToGql(s));
  }

  @Mutation(() => Boolean)
  async revokeSession(
    @Args('sessionId', { type: () => ID }) sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.revokeSessionHandler.execute(user.id, sessionId);
    return true;
  }

  @Mutation(() => Boolean)
  async logoutAllDevices(@CurrentUser() user: AuthenticatedUser): Promise<boolean> {
    await this.logoutAllDevicesHandler.execute(user.id);
    return true;
  }

  @Mutation(() => Boolean)
  async sendVerificationEmail(@CurrentUser() user: AuthenticatedUser): Promise<boolean> {
    await this.sendVerificationEmailHandler.execute(user.id);
    return true;
  }

  private toGql(user: User): UserGqlModel {
    const model = new UserGqlModel();
    model.id = user.id;
    model.email = user.email;
    model.displayName = user.displayName;
    model.timezone = user.timezone;
    model.accountStatus = user.accountStatus;
    model.createdAt = user.createdAt;
    model.updatedAt = user.updatedAt;
    return model;
  }

  private sessionToGql(session: Session): SessionGqlModel {
    const model = new SessionGqlModel();
    model.id = session.id;
    model.userId = session.userId;
    model.userAgent = session.userAgent ?? undefined;
    model.ipAddress = session.ipAddress ?? undefined;
    model.expiresAt = session.expiresAt;
    model.revokedAt = session.revokedAt ?? undefined;
    model.createdAt = session.createdAt;
    return model;
  }
}
