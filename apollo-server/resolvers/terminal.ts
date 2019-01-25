import { getModelResolver, getResolver } from '../util';
import TerminalModel from '../models/terminal';

var resolver = getModelResolver(new TerminalModel())

export default getResolver(resolver)