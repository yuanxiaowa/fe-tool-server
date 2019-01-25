import { SchemaDirectiveVisitor, AuthenticationError } from 'apollo-server'
import { defaultFieldResolver, GraphQLNonNull,GraphQLScalarType  } from 'graphql'

export class LengthDirective extends SchemaDirectiveVisitor {
  visitInputFieldDefinition(field) {
    this.wrapType(field);
  }

  visitFieldDefinition(field) {
    this.wrapType(field);
  }

  // Replace field.type with a custom GraphQLScalarType that enforces the
  // length restriction.
  wrapType(field) {
    if (field.type instanceof GraphQLNonNull &&
        field.type.ofType instanceof GraphQLScalarType) {
      field.type = new GraphQLNonNull(
        new LimitedLengthType(field.type.ofType, this.args));
    } else if (field.type instanceof GraphQLScalarType) {
      field.type = new LimitedLengthType(field.type, this.args);
    } else {
      throw new Error(`Not a scalar type: ${field.type}`);
    }
  }
}

class LimitedLengthType extends GraphQLScalarType {
  constructor(type, {
    max,
    min
  }) {
    super({
      name: `Length`,

      // For more information about GraphQLScalar type (de)serialization,
      // see the graphql-js implementation:
      // https://github.com/graphql/graphql-js/blob/31ae8a8e8312/src/type/definition.js#L425-L446

      serialize(value) {
        value = type.serialize(value);
        if (min) {
          if (value.length < min) {
            throw new Error(`最少${min}个字符`)
          }
        }
        if(max) {
          if (value.length > max) {
            throw new Error(`最多${max}个字符`)
          }
        }
        return value;
      },

      parseValue(value) {
        return type.parseValue(value);
      },

      parseLiteral(ast) {
        return type.parseLiteral(ast);
      }
    });
  }
}

export class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type._requiredAuthRole = this.args.requires;
  }
  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAuthRole = this.args.requires;
  }

  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    console.log(objectType)
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async function (...args) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRole =
          field._requiredAuthRole ||
          objectType._requiredAuthRole;

        if (!requiredRole) {
          return resolve.apply(this, args);
        }

        const { session: { user } } = args[2];
        if (!user) {
          throw new AuthenticationError('请先登录');
        }

        return resolve.apply(this, args);
      };
    });
  }
}