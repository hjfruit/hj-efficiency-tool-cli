import { ts } from 'ts-morph'

const getRouterUrls = (sourceFiles: ts.SourceFile[]) => {
  const pathArr = [] as string[]

  sourceFiles.forEach((sourceFileItem) => {
    delint(sourceFileItem)
  })

  function delint(sourceFile: ts.SourceFile) {
    delintNode(sourceFile)
    function delintNode(node: ts.Node) {
      if (
        node.kind === ts.SyntaxKind.StringLiteral &&
        node.parent.kind === ts.SyntaxKind.CallExpression
      ) {
        pathArr.push(node.getText())
      }
      ts.forEachChild(node, delintNode)
    }
  }

  const result = pathArr.map((v) => v.split("'")[1]) as string[]
  return result
}

export default getRouterUrls
