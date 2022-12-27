import path from 'path'
import isWinPlatform from './isWinPlatform'

const getRoutePathLast = (filePath: string) => {
  const pathStrList = isWinPlatform() ? filePath.split('\\') : filePath.split('/')
  const pathExtname = path.extname(pathStrList[pathStrList.length - 1]).split('.')[1]

  if (pathStrList[pathStrList.length - 1] === 'index') {
    return pathStrList[pathStrList.length - 2]
  }

  if (['tsx', 'ts', 'js', 'jsx'].includes(pathExtname)) {
    return pathStrList[pathStrList.length - 2]
  } else {
    return pathStrList[pathStrList.length - 1]
  }
}

export default getRoutePathLast
