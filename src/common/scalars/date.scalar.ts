import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, type ValueNode } from 'graphql';

/**
 * GraphQL DateTime scalar. Serializes as ISO-8601 string, parses back to Date.
 *
 * Why: GraphQL has no built-in DateTime type. Using a consistent scalar across
 * the API ensures clients get a predictable format and we avoid ad-hoc string
 * conversions scattered across resolvers.
 */
@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = 'ISO-8601 DateTime scalar';

  parseValue(value: unknown): Date {
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error('DateTime must be a string or number');
    }
    return new Date(value);
  }

  serialize(value: unknown): string {
    if (!(value instanceof Date)) {
      throw new Error('DateTime scalar can only serialize Date objects');
    }
    return value.toISOString();
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error('DateTime literal must be a string');
  }
}
