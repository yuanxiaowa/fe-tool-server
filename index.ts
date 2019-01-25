import path = require('path')
import Koa = require('koa')
import session = require('koa-session');
import { ApolloServer } from 'apollo-server-koa'
import http = require('http')

import logger = require('koa-logger')
import koaBody = require('koa-body')
import staticCache = require('koa-static-cache')

import typeDefs from './apollo-server/type-defs'
import resolvers from './apollo-server/resolvers'
import { AuthDirective, LengthDirective } from './apollo-server/directives'
import router from './routes'
import createSocketIO from './utils/ssh'
import { createReadStream } from 'fs';


const app = new Koa()
app.keys = ['some secret hurr'];

const apollowServer = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    auth: AuthDirective,
    // length: LengthDirective
  },
  context({ ctx }) {
    return {
      session: ctx.session
    }
  }
})

app.use(staticCache(path.join(__dirname, 'public'), {
  maxAge: 365 * 24 * 60 * 60
}))
app.use(logger())
app.use(session({
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  // maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
}, app))
apollowServer.applyMiddleware({
  app,
  cors: {
    credentials: true
  }
})
app.use((ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  return next()
})
app.use(koaBody())
app.use(router.routes()).use(router.allowedMethods())
app.use((ctx) => {
  ctx.type = 'html'
  if (ctx.path.endsWith('.html')) {
    ctx.body = createReadStream(path.join(__dirname, 'public', ctx.path))
    return
  }
  ctx.body = createReadStream(path.join(__dirname, 'public/index.html'))
})

const server = http.createServer(app.callback())

createSocketIO(server)

server.listen(4000, () => {
  console.log(`🚀 Server ready at http://localhost:4000${apollowServer.graphqlPath}`)
})