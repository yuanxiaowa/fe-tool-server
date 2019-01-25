import BaseModel from './base';

export default class SpecialModel extends BaseModel {
  constructor() {
    super('special')
  }

  list_fileds = ['id', 'name']
}