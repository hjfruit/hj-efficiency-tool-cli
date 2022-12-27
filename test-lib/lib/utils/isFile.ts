import fs from 'fs'

/**
 * 是文件
 * @param filePath 文件路径
 */
const isFile = (filePath: fs.PathLike) => {
  let result
  fs.stat(filePath, function (err, stat) {
    if (err) {
      throw err
    }

    result = stat.isFile() ? true : false
  })

  return result
}

export default isFile
