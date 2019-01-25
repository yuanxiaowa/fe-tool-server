import {
  Client,
  Server
} from 'ssh2'
import SocketIO = require('socket.io')
import http from 'http'
// @ts-ignore
import os = require('os')
import url = require('url')
import { decodeSecret } from '.';

function getPty() {
  try {
    return require('node-pty-prebuilt')
  } catch (e) { }
}

export default function (app: http.Server) {
  var io = SocketIO(app, {
    serveClient: false
  })
  /* io.use((socket, next) => {
    socket.request.
  }) */
  io.on('connection', (socket) => {
    var token = <string>url.parse(socket.request.url, true).query.token
    if (!token) {
      socket.emit('failed', '凭证无效')
      return
    }
    if (token === 'local') {
      var pty = getPty()
      if (pty) {
        let shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
        var ptyProcess = pty.spawn(shell, [], {
          name: 'xterm-color',
          cwd: process.env.HOME,
          env: process.env
        })
        ptyProcess.on('data', function (data: Buffer) {
          socket.send(data)
        })
        socket.on('message', data => {
          ptyProcess.write(data)
        })
        socket.on('disconnect', () => {
          ptyProcess.destroy()
        })
        socket.on('geometry', data => {
          ptyProcess.resize(data.cols, data.rows)
        })
        socket.emit('success')
        return
      }
    }
    var opt = {
      host: '10.10.11.13',
      password: 'eco@13',
      port: 22,
      username: 'root'
    }
    if (token !== 'local') {
      opt = decodeSecret(token)
    }
    var client = new Client()
    client.connect(opt)
    client.once('ready', () => {
      socket.once('disconnect', () => {
        client.end()
        client.destroy()
      })
      client.shell((err, stream) => {
        if (err) {
          socket.emit('failed', err.message)
          return
        }
        stream.on('data', (data: Buffer) => {
          socket.send(data.toString())
        })
        stream.stderr.on('data', (data: Buffer) => {
          socket.send(data.toString())
        })

        socket.on('message', (data: Buffer) => {
          stream.write(data)
        })
        socket.on('geometry', ({
          rows,
          cols
        }) => {
          stream.setWindow(rows, cols, 0, 0)
        })
        socket.emit('success')
      })
    })
    client.once('error', (e) => {
      socket.emit('failed', e.message)
    })
  })
}