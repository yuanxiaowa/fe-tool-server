import {
  status, add, del, resolve, commit, update, log, info, merge, mergeinfo, ls,
  getBranches,
  getTags,
  getTrunks
} from 'svn-tool2'
import { getResolver } from '../util';

export default getResolver({
  Query: {
    async svnStatus({ cwd }) {
      var [{ entries }] = await status(cwd)
      return entries
    },
    async svnLog({ path, page }) {
      page = page || 1
      var ret = await log(path)
      return {
        page,
        total: ret.length,
        items: ret.slice((page - 1) * 10, page * 10)
      }
    },
    async svnInfo({ path }) {
      var [ret] = await info(path)
      return ret
    },
    async svnMergeInfo({ path, url }) {
      return mergeinfo(path, url)
    },
    async svnLs({ path }) {
      return ls(path)
    },
    async svnStructure({ path }) {
      return Promise.all([
        getBranches(path).catch(() => []),
        getTags(path).catch(() => []),
        getTrunks(path).catch(() => [])
      ])
    },
  },
  Mutation: {
    svnUpdate({ paths, cwd }) {
      return update(cwd, paths)
    },
    svnAdd({ paths, cwd }) {
      return add(cwd, paths)
    },
    svnDel({ paths, cwd }) {
      return del(cwd, paths)
    },
    svnResolve({ paths, cwd, accept }) {
      return resolve(cwd, paths, accept)
    },
    svnCommit({ paths, cwd, msg }) {
      return commit(cwd, paths, msg)
    },
    svnMerge({ path, url, revisions }) {
      return merge(path, url, revisions)
    },
  }
})