import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, type ValueNode } from 'graphql';

@Scalar('JSON')
export class JsonScalar implements CustomScalar<unknown, unknown> {
  description = 'Arbitrary JSON scalar';

  parseValue(value: unknown): unknown {
    return value;
  }

  serialize(value: unknown): unknown {
    return value;
  }

  parseLiteral(ast: ValueNode): unknown {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return Number(ast.value);
      case Kind.NULL:
        return null;
      case Kind.LIST:
        return ast.values.map((value) => this.parseLiteral(value));
      case Kind.OBJECT:
        return Object.fromEntries(
          ast.fields.map((field) => [field.name.value, this.parseLiteral(field.value)]),
        );
      default:
        return null;
    }
  }
}
