import db from './db'
import shortid = require('shortid')
import R = require('ramda')
import BaseModel from './models/base';

export function getModelResolver(model: BaseModel) {
  var uname = model.name.replace(/\w/, _ => _.toUpperCase())
  return {
    Query: {
      [`${model.name}s`]: (args, session) => model.getAll(args, session),
      [model.name]: (args, session) => model.findOne(args, session)
    },
    Mutation: {
      [`edit${uname}`]: (args, session) => model.save(args, session),
      [`del${uname}`]: (args, session) => model.del(args, session)
    }
  }
}

export function getResolver(data: any) {
  var ret: any = Object.assign({}, data);
  [ret.Mutation, ret.Query].forEach(obj => {
    if (!obj) {
      return
    }
    Object.keys(obj).forEach(key => {
      var f = obj[key]
      obj[key] = (parent, args, {
        session
      }) => f(args, session, parent)
    })
  })
  return ret
}

export function getList(key: string, fn = R.identity) {
  return () => db.get(key).map(fn).value()
}

export function getItem(key: string, propName = 'id') {
  return R.compose(
    id => db.get(key).find(item => item.id === id).value(),
    R.prop(propName), R.nthArg(1)
  )
}

export function edit(key: string, propName: string = 'item') {
  return R.compose(async (data: any) => {
    if (!data.id) {
      let id = shortid()
      data.id = id
      await db.get(key).push(data).write()
      return id
    }
    await db.get(key)
      .find(({ id }) => data.id === id)
      .assign(data).write()
  }, R.prop(propName), R.nthArg(1))
}

export function del(key: string) {
  return R.compose(async id => {
    await db.get(key)
      .remove(item => item.id === id)
      .write()
  }, R.prop('id'), R.nthArg(1))
}