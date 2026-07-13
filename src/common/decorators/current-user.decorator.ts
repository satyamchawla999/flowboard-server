import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface AuthenticatedUser {
  id: string;
  email: string;
  sessionId: string;
}

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

/**
 * Extracts the authenticated user from the GraphQL context.
 * Populated by the JwtAuthGuard (to be implemented in the identity module).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const ctx = GqlExecutionContext.create(context);

    const request = ctx.getContext<{ req: RequestWithUser }>().req;

    return request.user as AuthenticatedUser;
  },
);
