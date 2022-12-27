import { ts } from 'ts-morph'
import readFile2Str from './readFile2Str'

function createSourceFiles(filePaths: string[]) {
  const sourceFiles = filePaths.map((file, index) => {
    const codeStr = readFile2Str(file)
    return ts.createSourceFile(
      `${index}.ts`,
      codeStr,
      ts.ScriptTarget.ESNext,
      true,
      ts.ScriptKind.TSX,
    )
  })

  return sourceFiles
}

export default createSourceFiles
