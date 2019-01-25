import BaseModel from './base';

export default class PathModel extends BaseModel {
  constructor() {
    super('path')
  }

  getAll({
    type
  }) {
    var types = type.split(' ')
    return this.model.getAll(item => types.includes(item.type))
  }
}