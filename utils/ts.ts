import * as ts from "ntypescript";
import * as fs from 'fs'
import * as R from 'ramda'

/* function printAllChildren(node: ts.Node, depth = 0) {
    console.log(new Array(depth + 1).join('----'), ts.formatSyntaxKind(node.kind), node.pos, node.end);
    depth++;
    node.getChildren().forEach(c=> printAllChildren(c, depth));
}

var sourceCode = `
var foo = 123;
`.trim();

var sourceFile = ts.createSourceFile('foo.ts', sourceCode, ts.ScriptTarget.ES5, true);
printAllChildren(sourceFile); */

type EnumItem = {
  name: string
  type: 'enum'
  items: string[]
}

type ClassItem = {
  name: string
  type: 'class' | 'interface'
  items: {
    name: string
    type: string
    default?: any
    required?: boolean
    is_referrence: boolean
    title?: string
  }[]
}

type TypeItem = {
  name: string
  type: 'type'
  ref_type: string
}

export function parse(code: string) {
  var sourceFile = ts.createSourceFile(
    'a.ts', code, ts.ScriptTarget.Latest, true)

  var arr: (TypeItem | EnumItem | ClassItem)[] = []
  ts.forEachChild(sourceFile, node => {
    if (ts.isInterfaceDeclaration(node)) {
      transformInterface(node)
    } else if (ts.isTypeAliasDeclaration(node)) {
      transformTypeAlias(node)
    } else if (ts.isClassDeclaration(node)) {
      transformClass(node)
    } else if (ts.isEnumDeclaration(node)) {
      transformEnum(node)
    }
  })
  function transformEnum(node: ts.EnumDeclaration) {
    var items = node.members.map(node => node.name.getText())
    arr.push({
      name: node.name.text,
      type: 'enum',
      items
    })
  }

  function getItem(id: string) {
    return arr.find(item => item.name === id)
  }

  function transformInterface(node: ts.InterfaceDeclaration) {
    var typeParameters = node.typeParameters && node.typeParameters.map(node => node.name.text)
    var obj: any = {
      title: node.jsDoc && node.jsDoc[0].comment,
      name: node.name.text,
      typeParameters,
      type: 'interface'
    }
    arr.push(obj)
    var items = node.members.map(transformMember).filter(Boolean)
    if (node.heritageClauses) {
      node.heritageClauses.map(node => {
        let id = node.types[0].expression.getText()
        let item = getItem(id)
        if (item) {
          items = R.uniqBy(R.prop('name'), items.concat(item.items))
        }
      })
    }
    obj.items = items
  }

  function transformTypeAlias(node: ts.TypeAliasDeclaration) {
    var typeParameters = node.typeParameters && node.typeParameters.map(node => node.name.text)
    var obj: any = {
      title: node.jsDoc && node.jsDoc[0].comment,
      name: node.name.text,
      typeParameters,
      type: 'type'
    }
    arr.push(obj)
    obj.ref_type = getType(obj.type)
    // if (node.)
    return obj
  }

  function transformClass(node: ts.ClassDeclaration) {
    var obj: any = {
      title: node.jsDoc && node.jsDoc[0].comment,
      name: node.name.text,
      type: 'class'
    }
    arr.push(obj)
    var items = node.members.map(transformMember).filter(Boolean)
    if (node.heritageClauses) {
      node.heritageClauses.map(node => {
        let id = node.types[0].expression.getText()
        let item = getItem(id)
        if (item) {
          items = R.uniqBy(R.prop('name'), R.clone(items).concat(item.items))
        }
      })
    }
    obj.items = items
  }

  function transformMember(node: ts.TypeElement) {
    var title = node.jsDoc && node.jsDoc[0].comment
    if (ts.isPropertySignature(node) || ts.isPropertyDeclaration(node)) {
      var name = node.name.getText()
      var required = !node.questionToken
      var def: any
      var ret: any = node.type && getType(node.type) || {}
      if (node.initializer) {
        if (ts.isNumericLiteral(node.initializer)) {
          def = Number(node.initializer.text)
          ret.type = ret.type || 'Number'
        } else if (ts.isStringLiteral(node.initializer)) {
          def = `${node.initializer.text}`
          ret.type = ret.type || 'String'
        } else if (node.initializer.kind === ts.SyntaxKind.TrueKeyword || node.initializer.kind === ts.SyntaxKind.FalseKeyword) {
          def = node.initializer.kind === ts.SyntaxKind.TrueKeyword ? true : false
          ret.type = ret.type || 'Boolean'
        }
      }
      return Object.assign({
        title,
        name,
        required,
        default: def,
        type: 'String'
      }, ret)
    }
    if (ts.isIndexSignatureDeclaration(node)) {
      let name = node.parameters[0].name.getText()
      let type = node.type && getType(node.type)
      return Object.assign({
        title,
        name,
        type: 'String',
        addtional: true
      }, type)
    }
  }

  var __id = 1
  function getTypeLiteral(node: ts.TypeLiteralNode) {
    var obj: any = {
      name: `Type${++__id}`,
      type: 'interface'
    }
    arr.push(obj)
    var items = node.members.map(transformMember).filter(Boolean)
    obj.items = items
    return obj.name
  }


  function getType(node: ts.TypeNode) {
    var type: string
    var is_referrence = false
    var items: any[]
    if (node.kind === ts.SyntaxKind.NumberKeyword) {
      type = 'Number'
    } else if (node.kind === ts.SyntaxKind.StringKeyword) {
      type = 'String'
    } else if (node.kind === ts.SyntaxKind.BooleanKeyword) {
      type = 'Boolean'
    } else if (ts.isArrayTypeNode(node)) {
      type = 'Array'
      items = getType(node.elementType)
    } else if (node.kind === ts.SyntaxKind.AnyKeyword) {
      type = 'Any'
    } else if (ts.isTypeReferenceNode(node)) {
      let name = node.typeName.getText()
      if (name !== 'Date') {
        if (name !== 'Regex') {
          is_referrence = true
          let typeArgs = node.typeArguments && node.typeArguments.map(getType)
          type = getRefType(typeArgs, name)
        } else {
          type = 'String'
        }
      } else {
        type = 'Date'
      }
    } else if (ts.isTypeLiteralNode(node)) {
      type = getTypeLiteral(node)
      is_referrence = true
    }
    return {
      type,
      items,
      is_referrence
    }
  }
  function getRefType(args: any[], name: string) {
    var item = getItem(name)
    var items
    if (item) {
      items = item.items.map(item => {
        var ret = Object.assign({}, item)
        if (ret.is_referrence) {
          ret.is_referrence = false
          ret.type = args.find((item, i) => item.type === ret.type)
        }
        return ret
      })
    }
    var obj: any = {
      name: `Type${id++}`,
      items,
      type: 'interface'
    }
    arr.push(obj)
    return obj.name
  }
  // fs.writeFileSync('data.json', JSON.stringify(arr, null, 2))

  return arr
}

export function toGql(code: string) {
  var arr = parse(code)
  return arr.map(item => {
    if (item.type === 'enum') {
      return `enum ${item.name} {
  ${item.items.join(',\n  ')}
}`
    }
    if (item.type === 'class' || item.type === 'interface') {
      let str = item.items.map(item => {
        var s = ''
        if (item.type === 'Array') {
          s = `[${item.items.type}]`
        } else if (item.type === 'Any') {
          s = 'String'
        } else {
          s = item.type
        }
        if (item.required) {
          s += '!'
        }
        return `${item.name}: ${s}`
      }).join('\n  ')
      return `type ${item.name} {
  ${str}
}`
    }
  }).join('\n')
}

export function toJsonSchema(code: string) {
  var arr = parse(code)
  var models: any = {}
  var ret = {
    models
  }
  arr.forEach(item => {
    if (item.type === 'enum') {
      models[item.name] = {
        enum: item.items
      }
    } else if (item.type === 'class' || item.type === 'interface') {
      let properties: any = {}
      let required: string[] = []
      item.items.forEach(item => {
        let type
        let items
        if (item.type === 'Any') {
          type = 'String'
        } else {
          type = item.type
        }
        if (type === 'Array' && item.items) {
          let type = item.items.type
          let $ref
          if (item.items.is_referrence) {
            type = undefined
            $ref = '#/models/' + type
          }
          items = {
            type,
            $ref
          }
        }
        if (item.required) {
          required.push(item.name)
        }
        properties[item.name] = {
          title: item.title,
          default: item.default,
          type: type && type.toLowerCase(),
          items,
          $ref: item.is_referrence ? '#/models/' + item.type : undefined
        }
      })
      models[item.name] = {
        type: 'object',
        properties,
        required
      }
    }
  })
  return JSON.stringify(ret, null, 2) //+ '\n' + JSON.stringify(arr, null, 2)
}

export function transform(code: string, type: string) {
  if (type === 'graphql') {
    return toGql(code)
  }
  return toJsonSchema(code)
}

// const printer = ts.createPrinter()

// toGql(fs.readFileSync('f.ts', 'utf8'))