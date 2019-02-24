import * as ts from 'ntypescript';


/* const printer: ts.Printer = ts.createPrinter();
const sourceFile: ts.SourceFile = ts.createSourceFile(
  'test.ts', 'const x  :  number = 42', ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS
);
console.log(printer.printFile(sourceFile)) */

// const lit = ts.createAdd(ts.createLiteral(42), ts.createLiteral("foo"));
const lit = ts.createArrowFunction([], [], [
    ts.createParameter([], [], undefined, 'x', undefined, ts.createTypeReferenceNode('number', []))
], undefined, undefined, ts.createLiteral(42));

/* const sourceFile: ts.SourceFile = 
    ts.createSourceFile('test.ts', '', ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
console.log(ts.createPrinter().printNode(ts.EmitHint.Expression, lit, sourceFile) );

const result: ts.TransformationResult<ts.SourceFile> = ts.transform(
  sourceFile, [ transformer ]
);

const transformedSourceFile: ts.SourceFile = result.transformed[0]; */
