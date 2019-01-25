import * as R from 'ramda'
import db from '../db'
import shortid = require('shortid')

export class SimpleDataModel {
  dbname: string
  constructor(public name: string) {
    this.dbname = `${name}s`
  }

  getAll(filter = R.always(true), mapper = R.identity) {
    return db
      .get(this.dbname)
      .filter(filter)
      .map(mapper)
      .value()
  }

  findOne(predicate: Function) {
    return db
      .get(this.dbname)
      .find(predicate)
      .value()
  }

  async save(item: any) {
    return db.get(this.dbname).push(item).write()
  }

  del(item: any) {
    return db
      .get(this.dbname)
      .remove(R.equals(item))
      .write()
  }
}

export default class DataModel extends SimpleDataModel {

  async save(item: any) {
    var m = db.get(this.dbname)
    if (!item.id) {
      item.id = shortid()
      await m.push(item).write()
      return item.id
    }
    await m
      .find(R.propEq('id', item.id))
      .assign(item)
      .write()
    return item.id
  }

  async del(id: string) {
    await db
      .get(this.dbname)
      .remove(R.propEq('id', id))
      .write()
    return id
  }
}