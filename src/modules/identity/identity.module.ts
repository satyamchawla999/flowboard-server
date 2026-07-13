import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { UserEntity } from './infrastructure/persistence/mikro-orm/entities/user.entity';
import { SessionEntity } from './infrastructure/persistence/mikro-orm/entities/session.entity';
import { UserMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/user.mikro-orm.repository';
import { SessionMikroOrmRepository } from './infrastructure/persistence/mikro-orm/repositories/session.mikro-orm.repository';
import { UserMapper } from './infrastructure/persistence/mikro-orm/mappers/user.mapper';
import { SessionMapper } from './infrastructure/persistence/mikro-orm/mappers/session.mapper';
import { TokenService } from './infrastructure/auth/token.service';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/auth/jwt-auth.guard';

import { AuthTokenIssuerService } from './infrastructure/services/auth-token-issuer.service';
import { DomainEventDispatcherService } from './infrastructure/services/domain-event-dispatcher.service';
import { PasswordHasherService } from './infrastructure/services/password-hasher.service';
import { IdentityEmailService } from './infrastructure/email/identity-email.service';
import { SignupHandler } from './features/signup/signup.handler';
import { LoginHandler } from './features/login/login.handler';
import { RefreshTokenHandler } from './features/refresh-token/refresh-token.handler';
import { LogoutHandler } from './features/logout/logout.handler';
import { ChangePasswordHandler } from './features/change-password/change-password.handler';
import { ForgotPasswordHandler } from './features/forgot-password/forgot-password.handler';
import { ResetPasswordHandler } from './features/reset-password/reset-password.handler';
import { SendVerificationEmailHandler } from './features/send-verification-email/send-verification-email.handler';
import { VerifyEmailHandler } from './features/verify-email/verify-email.handler';
import { GetMeHandler } from './features/get-me/get-me.handler';
import { UpdateProfileHandler } from './features/update-profile/update-profile.handler';
import { ListActiveSessionsHandler } from './features/list-active-sessions/list-active-sessions.handler';
import { RevokeSessionHandler } from './features/revoke-session/revoke-session.handler';
import { LogoutAllDevicesHandler } from './features/logout-all-devices/logout-all-devices.handler';

import { AuthResolver } from './infrastructure/presentation/graphql/resolvers/auth.resolver';
import { UserResolver } from './infrastructure/presentation/graphql/resolvers/user.resolver';

import { USER_REPOSITORY } from './domain/contracts/user.repository';
import { SESSION_REPOSITORY } from './domain/contracts/session.repository';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserEntity, SessionEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JwtModule is used by TokenService for sign/verify calls; secrets are
    // passed per-call from ConfigService so no global secret is set here.
    JwtModule.register({}),
  ],
  providers: [
    // Mappers
    UserMapper,
    SessionMapper,

    // Repository bindings
    { provide: USER_REPOSITORY, useClass: UserMikroOrmRepository },
    { provide: SESSION_REPOSITORY, useClass: SessionMikroOrmRepository },

    // Auth infrastructure
    TokenService,
    JwtStrategy,
    JwtAuthGuard,

    // Application services
    AuthTokenIssuerService,
    DomainEventDispatcherService,
    PasswordHasherService,
    IdentityEmailService,

    // Feature handlers
    SignupHandler,
    LoginHandler,
    RefreshTokenHandler,
    LogoutHandler,
    ChangePasswordHandler,
    ForgotPasswordHandler,
    ResetPasswordHandler,
    SendVerificationEmailHandler,
    VerifyEmailHandler,
    GetMeHandler,
    UpdateProfileHandler,
    ListActiveSessionsHandler,
    RevokeSessionHandler,
    LogoutAllDevicesHandler,

    // Resolvers
    AuthResolver,
    UserResolver,
  ],
  exports: [JwtAuthGuard],
})
export class IdentityModule {}
