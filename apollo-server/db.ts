import low = require('lowdb')
import FileSync = require('lowdb/adapters/FileSync')

const adapter  = new FileSync('data/db.json')
const db = low(adapter)

export default db.defaults({
  commands: [],
  commandTypes: [],
  terminals: [{
    "id": "1",
    "host": "local",
    "username": "本地",
    "password": ""
  }],
  specials: [],
  paths: [],
  users: [],
  jsons: []
})