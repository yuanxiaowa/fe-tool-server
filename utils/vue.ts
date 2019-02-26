import { parse, render } from 'ody-html-tree/util'
import {getTranspiler} from 'ody-transpiler/util'

export function transform(code: string, type: string) {
  if (type === 'angular') {
    type = 'ng'
  }
  var transpiler =  getTranspiler(type, 'data')
  if (transpiler) {
    let root = parse(code, '')
    transpiler.handle(root)
    return render([root])
  }
  return code
}