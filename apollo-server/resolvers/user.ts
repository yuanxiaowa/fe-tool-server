import { getResolver } from '../util';
import { ValidationError } from 'apollo-server'
import UserModel from '../models/user';

const model = new UserModel()

interface UserInput {
  username: string
  password: string
}

export default getResolver({
  Query: {
    userinfo(args, session) {
      return {
        username: session.user && session.user.username || '',
        role: session.user && session.user.role || 'GUEST'
      }
    }
  },
  Mutation: {
    async login({
      item: {
        username,
        password
      }
    }: { item: UserInput }, session) {
      var user = await model.getInfo(username, password)
      if (user) {
        session.user = user
        return {
          id: user.id,
          username,
          role: user.role
        }
      }
      throw new ValidationError('用户名或密码错误')
    },
    async register({
      item: {
        username,
        password
      }
    }: { item: UserInput }, session) {
      if (await model.checkUserName(username)) {
        throw new ValidationError('用户名已存在，请换一个')
      }
      let id = await model.save({
        item: {
          username,
          password,
          role: 'USER'
        }
      })
      let user = session.user = {
        id,
        username,
        role: 'USER'
      }
      return user
    },
    logout(args, session) {
      delete session.user
    }
  }
})