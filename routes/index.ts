import Router = require('koa-router')
import fs = require('fs')
import Path = require('path')
import cp = require('child_process')

const router = new Router()

router.get('/contents/(.*)', (ctx) => {
  var path = <string>ctx.params[0]
  var name = Path.basename(path)
  if (name.startsWith('.') || name.endsWith('.lock') || name.endsWith('.php')) {
    ctx.type = 'text'
  } else {
    ctx.type = Path.extname(name).substring(1)
  }
  ctx.body = fs.createReadStream(path)
})

router.get('/exec', (ctx) => {
  ctx.type = 'text/event-stream'
  ctx.status = 200
  ctx.respond = false
  var { stdout, stderr } = cp.exec(ctx.query.command)
  function write(event = 'message') {
    return (data: string) => {
      var ret = data.split('\n').map(data => `event: ${event}\ndata: ${data}`).join('\n')
      ctx.res.write(`${ret}\n\n`)
    }
  }
  function end() {
    ctx.res.end(`id: close\ndata: \n\n`)
  }
  stdout.on('data', write()).on('close', end)
  stderr.on('data', write('error'))
})

export default router