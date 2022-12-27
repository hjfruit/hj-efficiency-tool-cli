import path from 'path'

/**
 * 文件/目录是否存在
 * @param filePath 文件路径
 * @returns true:有扩展名;false:不存在扩展名
 */
const isHasExtname = (filePath: string) => (path.extname(filePath) ? true : false)

export default isHasExtname
