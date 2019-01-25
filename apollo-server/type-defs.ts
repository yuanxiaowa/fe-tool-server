import { join } from 'path'
import { importSchema } from 'graphql-import'

var schema = importSchema(join(__dirname, 'schema.graphql'))

export default schema.replace('scalar Upload', '')