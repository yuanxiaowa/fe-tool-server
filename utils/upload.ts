import { createWriteStream, ensureDirSync } from 'fs-extra'
import { resolve } from 'path'
import { generate } from 'shortid'
import db from '../apollo-server/db'

const uploadDir = resolve(__dirname, '../data/uploads')

// Ensure upload directory exists
ensureDirSync(uploadDir)

const storeUpload = async ({ stream, filename }) => {
  const id = generate()
  const file = `${id}-${filename}`
  const path = `${uploadDir}/${file}`
  const urlPath = `files/${file}`

  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on('finish', () => resolve({ id, path: urlPath }))
      .on('error', reject),
  )
}

const recordFile = file =>
  db
    .get('uploads')
    .push(file)
    .last()
    .write()

export async function processUpload (file) {
  const { stream, filename, mimetype, encoding } = await file
  const { id, path } = await storeUpload({ stream, filename })
  return recordFile({ id, filename, mimetype, encoding, path })
}
