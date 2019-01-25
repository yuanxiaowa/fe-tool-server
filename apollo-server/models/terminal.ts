import { encodeSecret } from '../../utils';
import BaseModel from './base';

export default class TerminalModel extends BaseModel {
  constructor() {
    super('terminal')
  }

  getAll(args, session) {
    return this.model.getAll(
      item => !item.user || item.user === session.user.username,
      item => ({
        token: item.host === 'local' ? 'local' : encodeSecret(item),
        id: item.id,
        host: item.host,
        username: item.username
      })
    )
  }
}