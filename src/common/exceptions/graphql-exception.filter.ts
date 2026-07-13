import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { DomainError, EntityNotFoundError } from '@common/errors';
import { ApplicationError, UnauthorizedError, ForbiddenError } from '@common/errors';

/**
 * Translates domain/application errors into GraphQL-friendly errors.
 *
 * Why a single catch-all filter: we want one consistent error shape across
 * every resolver. Errors thrown in domain/application layers carry a `code`
 * field — we surface that as the GraphQL error extension so clients can handle
 * errors by code rather than parsing strings.
 */
@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): GraphQLError {
    GqlArgumentsHost.create(host);

    if (exception instanceof EntityNotFoundError) {
      return new GraphQLError(exception.message, {
        extensions: { code: exception.code },
      });
    }

    if (exception instanceof DomainError) {
      return new GraphQLError(exception.message, {
        extensions: { code: exception.code },
      });
    }

    if (exception instanceof UnauthorizedError) {
      return new GraphQLError(exception.message, {
        extensions: { code: 'UNAUTHORIZED' },
      });
    }

    if (exception instanceof ForbiddenError) {
      return new GraphQLError(exception.message, {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    if (exception instanceof ApplicationError) {
      return new GraphQLError(exception.message, {
        extensions: { code: exception.code },
      });
    }

    this.logger.error('Unhandled exception', exception);

    return new GraphQLError('Internal server error', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }
}
