import fs = require('fs-extra')
import Path = require('path')

export function info(path: string) {
  var name = Path.basename(path)
  try {
    let s = fs.statSync(path)
    return {
      name,
      path,
      type: s.isDirectory() ? 'folder' : 'file',
      size: s.size,
      hidden: name.startsWith('.'),
      forbidden: false
    }
  } catch (e) {
    return {
      name,
      path,
      type: 'file',
      size: 0,
      hidden: true,
      forbidden: true
    }
  }
}

export async function list(path: string) {
  var files = await fs.readdir(path + '/')
  return files.map(name => info(Path.join(path, name))).sort((a, b) => {
    if (a.type === b.type) {
      return a.path < b.path ? -1 : 1
    }
    return a.type === 'folder' ? -1 : 1
  })
}

export function save(path: string, contents: string) {
  return fs.writeFile(path, contents)
}

export function mkdir(path: string) {
  return fs.mkdirp(path)
}

export function remove(path: string) {
  return fs.remove(path)
}