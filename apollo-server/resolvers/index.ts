import R = require('ramda')
import { readdirSync } from 'fs'
import GraphQLJSON = require('graphql-type-json')

var modules = readdirSync(__dirname + '/.')
  .filter(item => item.endsWith('.js'))
  .filter(item => item !== 'index.js')
  .map(item => require(`./${item}`).default)

export default R.reduce(R.mergeDeepLeft, {
  JSON: GraphQLJSON
})(modules)