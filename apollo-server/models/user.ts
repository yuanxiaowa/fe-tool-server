import BaseModel from './base';

export default class UserModel extends BaseModel {
  constructor() {
    super('user')
  }

   getInfo(username: string, password: string) {
    return this.model
      .findOne(item => item.username === username && item.password === password)
  }

  async checkUserName(username: string) {
    var user = await this.model.findOne(item => item.username === username)
    return !!user
  }
}