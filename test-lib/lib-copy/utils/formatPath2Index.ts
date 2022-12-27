import path from 'path'

const formatPath2Index = (filePath: string, index = 'index.tsx') => {
  const indexBaseName = index.split('.')[0]
  const indexExtname = index.split('.')[1]
  const basename = path.basename(filePath)
  const extname = path.extname(basename)

  const isHasExtname = !!extname

  if (!isHasExtname) {
    if (basename === indexBaseName) {
      return filePath + '.' + indexExtname
    } else {
      return path.join(filePath, index)
    }
  } else {
    return filePath
  }
}

export default formatPath2Index
