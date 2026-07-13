import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import type { Request } from 'express';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser, type AuthenticatedUser } from '@common/decorators/current-user.decorator';
import { SignupHandler } from '../../../../features/signup/signup.handler';
import { LoginHandler } from '../../../../features/login/login.handler';
import { LogoutHandler } from '../../../../features/logout/logout.handler';
import { RefreshTokenHandler } from '../../../../features/refresh-token/refresh-token.handler';
import { ChangePasswordHandler } from '../../../../features/change-password/change-password.handler';
import { ForgotPasswordHandler } from '../../../../features/forgot-password/forgot-password.handler';
import { ResetPasswordHandler } from '../../../../features/reset-password/reset-password.handler';
import { VerifyEmailHandler } from '../../../../features/verify-email/verify-email.handler';
import { AuthPayloadGqlModel } from '../models/auth-payload.model';
import { UserGqlModel } from '../models/user.model';
import { SignupInput } from '../inputs/signup.input';
import { LoginInput } from '../inputs/login.input';
import { ChangePasswordInput } from '../inputs/change-password.input';
import { ForgotPasswordInput } from '../inputs/forgot-password.input';
import { ResetPasswordInput } from '../inputs/reset-password.input';
import type { AuthPayloadDto } from '../../../../contracts/auth-payload.dto';
import type { User } from '../../../../domain/models/user.model';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly signupHandler: SignupHandler,
    private readonly loginHandler: LoginHandler,
    private readonly logoutHandler: LogoutHandler,
    private readonly refreshTokenHandler: RefreshTokenHandler,
    private readonly changePasswordHandler: ChangePasswordHandler,
    private readonly forgotPasswordHandler: ForgotPasswordHandler,
    private readonly resetPasswordHandler: ResetPasswordHandler,
    private readonly verifyEmailHandler: VerifyEmailHandler,
  ) {}

  @Public()
  @Mutation(() => AuthPayloadGqlModel)
  async signup(@Args('input') input: SignupInput): Promise<AuthPayloadGqlModel> {
    const result = await this.signupHandler.execute({
      email: input.email,
      displayName: input.displayName,
      password: input.password,
    });

    return this.toGql(result);
  }

  @Public()
  @Mutation(() => AuthPayloadGqlModel)
  async login(
    @Args('input') input: LoginInput,
    @Context() ctx: { req: Request },
  ): Promise<AuthPayloadGqlModel> {
    const result = await this.loginHandler.execute({
      email: input.email,
      password: input.password,
      userAgent: ctx.req.headers['user-agent'] ?? null,
      ipAddress: ctx.req.ip ?? null,
    });
    return this.toGql(result);
  }

  @Mutation(() => Boolean)
  async logout(@CurrentUser() user: AuthenticatedUser): Promise<boolean> {
    await this.logoutHandler.execute(user.sessionId);
    return true;
  }

  @Public()
  @Mutation(() => AuthPayloadGqlModel)
  async refreshToken(@Args('refreshToken') refreshToken: string): Promise<AuthPayloadGqlModel> {
    const result = await this.refreshTokenHandler.execute(refreshToken);
    return this.toGql(result);
  }

  @Mutation(() => Boolean)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    await this.changePasswordHandler.execute(user.id, {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    });
    return true;
  }

  @Public()
  @Mutation(() => Boolean)
  async forgotPassword(@Args('input') input: ForgotPasswordInput): Promise<boolean> {
    await this.forgotPasswordHandler.execute({ email: input.email });
    return true;
  }

  @Public()
  @Mutation(() => Boolean)
  async resetPassword(@Args('input') input: ResetPasswordInput): Promise<boolean> {
    await this.resetPasswordHandler.execute({
      token: input.token,
      newPassword: input.newPassword,
    });
    return true;
  }

  @Public()
  @Mutation(() => Boolean)
  async verifyEmail(@Args('token') token: string): Promise<boolean> {
    await this.verifyEmailHandler.execute(token);
    return true;
  }

  private toGql(result: AuthPayloadDto): AuthPayloadGqlModel {
    const model = new AuthPayloadGqlModel();
    model.accessToken = result.accessToken;
    model.refreshToken = result.refreshToken;
    model.user = this.userToGql(result.user);
    return model;
  }

  private userToGql(user: User): UserGqlModel {
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
}
