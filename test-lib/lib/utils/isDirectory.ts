import fs from 'fs'

/**
 * 是目录
 * @param filePath 文件路径
 * @returns {Promise<boolean>} true:是 存在;false:不是或不存在
 */
const isDirectory = async (filePath: fs.PathLike) =>
  await fs.promises
    .stat(filePath)
    .then((stat) => stat.isDirectory())
    .catch(() => false)

export default isDirectory
