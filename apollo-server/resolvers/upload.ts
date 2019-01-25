import { processUpload } from '../../utils/upload'
import { getList } from '../util';

export default {
  Query: {
    uploads: getList('uploads')
  }
  Mutation: {
    singleUpload: (root, { file }) => processUpload(file),
    multipleUpload: (root, { files }) => Promise.all(files.map(processUpload))
  }
}