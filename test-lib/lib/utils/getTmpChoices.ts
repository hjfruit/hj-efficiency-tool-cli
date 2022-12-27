import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import isExistSync from './isExistSync'

export default function getTmpChoices(gitUrl: string) {
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
  spawnSync('git', ['pull'], {
    cwd: dirPath,
  })
  // 获取远程分支结果
  const result = spawnSync('git', ['branch', '-a'], { cwd: dirPath })

  fs.rmSync(dirPath, { recursive: true })

  return result.output
    .toString()
    .split(',')[1]
    .split('\n')
    .filter(Boolean)
    .map((val) => val.replace('  remotes/origin/', ''))
}
