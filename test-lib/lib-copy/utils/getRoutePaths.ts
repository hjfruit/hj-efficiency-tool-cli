import { ts } from 'ts-morph'
import readFile2Str from '../utils/readFile2Str'
import formatPath2Index from './formatPath2Index'

const getRoutePaths = (path: string | string[]) => {
  const nodePathArr = [] as string[]
  let sourceFile: ts.SourceFile
  let sourceFiles: ts.SourceFile[]
  const isPathArray = Array.isArray(path)

  if (isPathArray) {
    sourceFiles = path.map((pathItem) => {
      const tmpPath = formatPath2Index(pathItem)
      const codeStr = readFile2Str(tmpPath)
      return ts.createSourceFile(
        'file.ts',
        codeStr,
        ts.ScriptTarget.ESNext,
        true,
        ts.ScriptKind.TSX,
      )
    })

    sourceFiles.forEach((sourceFileItem) => {
      delint(sourceFileItem)
    })
  }

  if (!isPathArray) {
    const tmpPath = formatPath2Index(path)
    const codeStr = readFile2Str(tmpPath)
    sourceFile = ts.createSourceFile(
      'file.ts',
      codeStr,
      ts.ScriptTarget.ESNext,
      true,
      ts.ScriptKind.TSX,
    )
    delint(sourceFile)
  }

  function delint(sourceFile: ts.SourceFile) {
    delintNode(sourceFile)
    function delintNode(node: ts.Node) {
      if (
        node.kind === ts.SyntaxKind.StringLiteral &&
        node.parent.kind === ts.SyntaxKind.CallExpression
      ) {
        nodePathArr.push(node.getText())
      }
      ts.forEachChild(node, delintNode)
    }
  }

  const result = nodePathArr.map((v) => v.split("'")[1]) as string[]
  return result
}

export default getRoutePaths
