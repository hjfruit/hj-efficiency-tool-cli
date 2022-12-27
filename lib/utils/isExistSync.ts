import fs from 'fs'
import chalk from 'chalk'

/**
 * 判断文件是否存在
 */
const isExistSync = (path: string) => {
  let result
  try {
    if (fs.existsSync(path)) {
      result = true
    } else {
      result = false
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(chalk.red(error))
  }

  return result
}

export default isExistSync
