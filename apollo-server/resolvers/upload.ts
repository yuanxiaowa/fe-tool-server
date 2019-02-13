import { processUpload } from '../../utils/upload'
import { getList } from '../util';

export default {
  Query: {
    uploads: getList('uploads')
  },
  Mutation: {
    singleUpload: (root: any, { file }: any) => processUpload(file),
    multipleUpload: (root: any, { files }: any) => Promise.all(files.map(processUpload))
  }
}