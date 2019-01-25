import { getList, del } from '../util';
import shortid from 'shortid'
import db from '../db'
import { join } from 'path'
import { mkdir, save } from '../../utils/file';


const key = 'jsons'

const dir = join(process.cwd(), 'data', 'schemas')

mkdir(dir)

export default {
  Query: {
    jsons: getList(key)
  },
  Mutation: {
    async addJson(_, {
      item
    }) {
      var id = shortid()
      var path = join(dir, `${id}.json`)
      await Promise.all([
        save(path, item.content),
        db.get(key)
          .push({
            id,
            path,
            name: item.name
          })
      ])
      return path
    },
    delPath: del(key)
  }
}