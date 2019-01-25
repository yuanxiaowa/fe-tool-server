import { getModelResolver, getResolver } from '../util';
import PathModel from '../models/path';

var resolver = getModelResolver(new PathModel())

export default getResolver(resolver)