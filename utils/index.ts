interface HostInfo {
  username: string
  password: string
  port: number
  host: string
}

export function encodeSecret({
  username,
  password,
  port,
  host
}: HostInfo) {
  var isFirst = username.length >= password.length
  var ret = []
  var len = isFirst ? password.length : username.length
  for (let i = 0; i < len; i++) {
    ret.push(username[i])
    ret.push(password[i])
  }
  ret.push(...(isFirst ? username : password).substring(len))
  var len1 = username.length + ''
  var len2 = password.length + ''
  var result = len1.length + ':' + len2.length + ':' + host + ':' + port + ':' + username.length + ret.reverse().join('') + password.length
  return new Buffer(result).toString('base64')
}

export function decodeSecret(token: string): HostInfo {
  token = new Buffer(token, 'base64').toString()
  var i1 = token.indexOf(':')
  var len1 = +token.substring(0, i1)
  token = token.substring(i1 + 1)

  var i2 = token.indexOf(':')
  var len2 = +token.substring(0, i2)
  token = token.substring(i2 + 1)

  var i3 = token.indexOf(':')
  var host = token.substring(0, i3)
  token = token.substring(i3 + 1)

  var i4 = token.indexOf(':')
  var port = token.substring(0, i4)
  token = token.substring(i4 + 1)

  var username_len = +token.substring(0, len1)
  token = token.substring(len1)
  var password_len = +token.substring(token.length - len2)
  token = token.substring(0, token.length - len2)
  var arr = token.split('').reverse()
  var isFirst = username_len >= password_len
  var len = isFirst ? password_len : username_len
  var username = ''
  var password = ''
  for (let i = 0; i < len; i++) {
    username += arr[i * 2]
    password += arr[i * 2 + 1]
  }
  if (isFirst) {
    username += arr.slice(2 * len).join('')
  } else {
    password += arr.slice(2 * len).join('')
  }
  return {
    username,
    password,
    host,
    port
  }
}