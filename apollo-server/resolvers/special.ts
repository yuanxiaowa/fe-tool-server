import { getModelResolver, getResolver } from '../util';
import SpecialModel from '../models/special';

var resolver = getModelResolver(new SpecialModel())

export default getResolver(resolver)