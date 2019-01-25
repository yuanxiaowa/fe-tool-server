import { join } from 'path'
import { save, mkdir } from '../../utils/file'
import { getResolver } from '../util';
import PathModel from '../models/path';

var model = new PathModel()
const dir_apidoc = join(process.cwd(), 'data/skl')

mkdir(dir_apidoc)

function getPath(id: string, ext = 'json') {
  return join(dir_apidoc, id + '.' + ext)
}

export default getResolver({
  Mutation: {
    async editSkl({
      id,
      content,
      path
      ext
    }) {
      var promises = []
      if (!path || path === '-') {
        path = getPath(id, ext)
        promises.push(model.save({
          item: {
            id,
            path
          }
        }))
      }
      promises.push(save(path, content || ''))
      await Promise.all(promises)
      return path
    }
  }
})