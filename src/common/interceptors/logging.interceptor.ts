import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Logs GraphQL operation name and duration for every request.
 *
 * Why: Structured request logs are foundational observability. We log the
 * operation name (not the full query, which can be large) and duration.
 * This is a cross-cutting concern that belongs in an interceptor, not in
 * individual resolvers.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('GraphQL');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const operationName = info?.fieldName ?? 'unknown';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(`${operationName} — ${Date.now() - start}ms`);
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          this.logger.error(`${operationName} — ${Date.now() - start}ms — ERROR: ${message}`);
        },
      }),
    );
  }
}
