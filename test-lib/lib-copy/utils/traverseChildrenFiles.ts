import path from 'path'
import { FileType } from '../global'
import formatPath2Index from './formatPath2Index'

type arrType = {
  dirname: string
  code?: string
  filename?: string
}

const traverseChildrenFiles = (
  childrenFile: FileType,
  filePath: string,
  arr: arrType[] = [],
) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const dir = path.join(filePath, childrenFile.dirname!)

  if (childrenFile?.filename) {
    const tmpPath = dir
    arr.push({
      dirname: tmpPath,
      code: childrenFile.code,
      filename: formatPath2Index(dir, childrenFile?.filename),
    })
  } else {
    arr.push({ dirname: dir, code: childrenFile.code })
  }

  if (childrenFile?.childrenFiles?.length) {
    childrenFile?.childrenFiles?.forEach((val) => {
      traverseChildrenFiles(val, dir, arr)
    })
  }

  return arr
}

export default traverseChildrenFiles
