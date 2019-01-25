import { getModelResolver, getResolver } from '../util';
import CommandModel from '../models/command';

var resolver = getModelResolver(new CommandModel())

export default getResolver(resolver)