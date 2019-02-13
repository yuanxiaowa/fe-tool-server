import { list, save, mkdir, remove } from '../../utils/file'
import * as R from 'ramda'

const getPath = R.prop('path')

type FileType = 'folder' | 'file'

interface File {
  path: string
  name: string
  hidden: boolean
  size: number
  type: FileType
  fobidden: boolean
  children: File[]
}

export default {
  File: {
    children({ path }: File) {
      return list(path)
    }
  },
  Query: {
    // files: (root, { path }) => new Promise(resolve => setTimeout(() => resolve(list(path)), 2000)
    files: R.compose(list, getPath, R.nthArg(1))
  },
  Mutation: {
    saveFile: (root, { path, contents }: {
      path: string
      contents: string
    }) => save(path, contents),
    removeFile: R.compose(remove, getPath, R.nthArg(1)),
    mkdir: R.compose(mkdir, getPath, R.nthArg(1))
  }
}