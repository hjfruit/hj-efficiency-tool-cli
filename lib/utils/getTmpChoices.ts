import { spawn, spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import isExistSync from './isExistSync'

// export default function getTmpChoices(gitUrl: string, cb?: any) {
//   return new Promise((resolve, reject) => {
//     const dirPath = path.join(process.cwd(), '../', 'tmp-code-tmp-code-tmp-code-tmp-code')

//     if (isExistSync(dirPath)) fs.rmSync(dirPath, { recursive: true })

//     fs.mkdirSync(dirPath)
//     // 初始化git
//     spawnSync('git', ['init'], {
//       cwd: dirPath,
//     })
//     // 添加远程仓库地址
//     spawnSync('git', ['remote', 'add', 'origin', gitUrl], {
//       cwd: dirPath,
//     })
//     // 初始化pull一下远程信息
//     spawnSync('git', ['pull'], {
//       cwd: dirPath,
//     })
//     // 获取远程分支结果
//     const answer = spawnSync('git', ['branch', '-a'], { cwd: dirPath })

//     fs.rmSync(dirPath, { recursive: true })

//     const result = answer.output
//       .toString()
//       .split(',')[1]
//       .split('\n')
//       .filter(Boolean)
//       .map((val) => val.replace('  remotes/origin/', '')) as string[]

//     if (result.length === 0) reject('网络异常，远程模板获取失败！')

//     resolve(result)
//   })
// }

function spawnCommand(
  cmdFirst: string,
  args: string[],
  targetPath: string,
  cb?: () => void,
) {
  const process = spawn(cmdFirst, args, { cwd: targetPath })
  process.on('close', () => {
    cb?.()
  })
}

export default function getTmpChoices(gitUrl: string, callback?: (err?: string) => void) {
  return new Promise((resolve, reject) => {
    const dirPath = path.join(process.cwd(), '../', 'tmp-code-tmp-code-tmp-code-tmp-code')
    if (isExistSync(dirPath)) fs.rmSync(dirPath, { recursive: true })
    fs.mkdirSync(dirPath)

    // 初始化git
    spawnSync('git', ['init'], {
      cwd: dirPath,
    })
    // 添加远程仓库地址
    spawnSync('git', ['remote', 'add', 'origin', gitUrl], {
      cwd: dirPath,
    })

    // 初始化pull一下远程信息
    spawnCommand('git', ['pull'], dirPath, () => {
      // 获取远程分支结果
      const answer = spawnSync('git', ['branch', '-a'], { cwd: dirPath })
      const result = answer.output
        .toString()
        .split(',')[1]
        .split('\n')
        .filter(Boolean)
        .map((val) => val.replace('  remotes/origin/', '')) as string[]

      fs.rmSync(dirPath, { recursive: true })

      if (result.length === 0) {
        callback?.('网络异常，远程模板获取失败！')
        reject()
      }
      callback?.()
      resolve(result)
    })
  })
}
