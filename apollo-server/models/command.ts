import BaseModel from './base';
import { SimpleDataModel } from './data';

export default class CommandModel extends BaseModel {
  constructor() {
    super('command')
  }
}

export class CommandTypeModel extends BaseModel {
  constructor() {
    super('commandType', new SimpleDataModel('commandType'))
  }
}