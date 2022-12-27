import fs from 'fs'
import path from 'path'

function walkSync(
  currentDirPath: string,
  callback: (filePath: string, stat?: fs.Dirent) => void,
) {
  fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach((dirent) => {
    const filePath = path.join(currentDirPath, dirent.name)

    if (dirent.isFile()) callback?.(filePath, dirent)
    if (dirent.isDirectory()) walkSync(filePath, callback)
  })
}

export default walkSync
