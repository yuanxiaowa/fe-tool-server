import { getModelResolver, getResolver } from '../util';
import { CommandTypeModel } from '../models/command';

var resolver = getModelResolver(new CommandTypeModel())

export default getResolver(resolver)