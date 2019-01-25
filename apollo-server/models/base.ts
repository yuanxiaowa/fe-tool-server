import DataModel, { SimpleDataModel } from "./data";
import * as R from 'ramda'

export default class BaseModel {

  list_fileds?: string[]

  constructor(public name: string, public model: SimpleDataModel = new DataModel(name)) {
  }

  getAll() {
    if (this.list_fileds) {
      return this.model.getAll(R.always(true), R.pick(this.list_fileds))
    }
    return this.model.getAll()
  }

  findOne({
    id
  }) {
    return this.model.findOne(item => item.id === id)
  }

  save({
    item
  }) {
    return this.model.save(item)
  }

  del({
    id
  }) {
    return this.model.del(id)
  }
}