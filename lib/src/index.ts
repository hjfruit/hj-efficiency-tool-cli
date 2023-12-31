import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import { Command } from 'commander'
import inquirer from 'inquirer'
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt'
import chalk from 'chalk'
import download from 'download-git-repo'
import isWinPlatform from '../utils/isWinPlatform'
import getTmpChoices from '../utils/getTmpChoices'
import isExistSync from '../utils/isExistSync'
import oraSpinner from '../utils/oraSpinner'

inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection)
const program = new Command()

program
  .command('tmp-code [input]')
  .description('gen template code')
  .option('-r, --remote [gitUrl]', '文件生成位置')
  .action(async (input, { remote }) => {
    const rootPath = input || './src/pages'

    if (!remote) {
      // eslint-disable-next-line no-console
      console.log(chalk.bgRed('缺少模板代码仓库的远程地址'))
      process.exit(1)
    }

    // 选取模板代码容器目录层级
    const dirnameRes = await inquirer.prompt([
      {
        type: 'file-tree-selection',
        name: 'dirname',
        root: rootPath,
      },
      {
        type: 'input',
        name: 'filename',
      },
    ])
    const dir = JSON.parse(JSON.stringify(dirnameRes)).dirname
    const file = JSON.parse(JSON.stringify(dirnameRes)).filename
    // 拼接所需要的绝对dir绝对path
    const absoluteDirPath = path.join(dir, file)

    oraSpinner({
      text: '⏰ fetch template name choices......',
    })
    // 获取模板string数组
    const tmpChoices = await getTmpChoices(remote, (err) => {
      if (err) {
        oraSpinner({
          text: '⏰ fetch template name choices fail......',
          type: 'fail',
        })
        process.exit(1)
      }

      return oraSpinner({
        text: '⏰ fetch template name choices success......',
        type: 'succeed',
      })
    })

    const templateNameRes = await inquirer.prompt([
      {
        type: 'list',
        name: 'tmpName',
        message: `请选择 ${chalk.hex('#FFA666').underline(absoluteDirPath)} 对应模版名称`,
        choices: tmpChoices,
      },
    ])
    const branchName = JSON.parse(JSON.stringify(templateNameRes)).tmpName

    if (!isExistSync(absoluteDirPath)) fs.mkdirSync(absoluteDirPath, { recursive: true })

    oraSpinner({
      text: '⏰ fetch origin template code......',
    })
    download(
      'direct:' + remote + '#' + branchName,
      absoluteDirPath,
      { clone: true },
      (err: string) => {
        if (err) {
          fs.rmSync(absoluteDirPath, { recursive: true })
          oraSpinner({
            text: '⏰ fetch origin template code fail!!!......',
            type: 'fail',
          })
        } else {
          // 创建对应的gql文件
          createGqlFile(absoluteDirPath)
          // 创建对应router文件
          const routerDir = createRouterFile(absoluteDirPath)
          // 最后一步格式化代码style
          formatCode([absoluteDirPath, routerDir], () => {
            oraSpinner({
              text: '⏰ fetch origin template code success!!!......',
              type: 'succeed',
            })
          })
        }
      },
    )
  })

program.parse()

// 根据绝对路径创建对应的gql文件
function createGqlFile(dir: string) {
  const gqlDirArr = dir
    .replace('pages', isWinPlatform() ? 'graphql\\operations' : 'graphql/operations')
    .split(isWinPlatform() ? '\\' : '/')

  const gqlDir = gqlDirArr
    .slice(0, gqlDirArr.length - 1)
    .join(isWinPlatform() ? '\\' : '/')
  const gqlDirLast = gqlDirArr.join(isWinPlatform() ? '\\' : '/')
  const gqlFile = gqlDirLast + '.gql'

  if (isExistSync(gqlDir)) {
    if (!isExistSync(gqlFile)) fs.writeFileSync(gqlFile, '')
    return
  }

  fs.mkdirSync(gqlDir, { recursive: true })
  fs.writeFileSync(gqlFile, '')
}

// 创建router文件
function createRouterFile(dir: string) {
  const routerDir = dir.replace(
    'pages',
    isWinPlatform() ? 'router\\config' : 'router/config',
  )
  const routerFile = path.join(routerDir, 'index.tsx')
  const routerPath = path.join(routerDir, 'path.ts')

  if (isExistSync(routerDir)) {
    if (!isExistSync(routerFile)) fs.writeFileSync(routerFile, '')
    if (isExistSync(routerPath)) fs.writeFileSync(routerPath, '')
    // 写入router模板代码
    writeFileRouter(dir, routerFile)
    // 写入router path模板代码
    writeFileRouterPath(dir, routerPath)
    return routerDir
  }

  fs.mkdirSync(routerDir, { recursive: true })
  fs.writeFileSync(routerFile, '')
  fs.writeFileSync(routerPath, '')

  // 写入router模板代码
  writeFileRouter(dir, routerFile)
  // 写入router path模板代码
  writeFileRouterPath(dir, routerPath)
  return routerDir
}

// router文件写入模板配置
function writeFileRouter(dir: string, routerFile: string) {
  const routerTmpFile = path.join(dir, 'router.tsx')
  if (!isExistSync(routerTmpFile)) return

  const tmpDir = dir.replace(path.join(process.cwd(), 'src'), '@').split('\\').join('/')
  const tmpContent = fs.readFileSync(routerTmpFile).toString()
  // 替换模板里面组件引入路径
  const content = tmpContent
    .split('\n')
    .map((val) => {
      return val.replace('pre-router', tmpDir)
    })
    .join('\n')

  fs.writeFileSync(routerFile, content)

  // 最后删除pages下面的router配置文件
  if (isExistSync(routerTmpFile)) fs.rmSync(routerTmpFile)
}

// 使用 prettier 格式化代码
function formatCode(dir: string[], cb?: () => void) {
  const formatPathArr = dir.map((itm) => `${path.join(itm, '/**')}`)
  const npx = isWinPlatform() ? 'npx.cmd' : 'npx'

  const program = spawn(npx, ['prettier', '--write', ...formatPathArr])
  program.on('close', () => {
    cb?.()
  })
}

// path文件写入模板配置
function writeFileRouterPath(dir: string, pathFile: string) {
  const routerTmpFile = path.join(dir, 'path.ts')

  if (!isExistSync(routerTmpFile)) return

  const tmpContent = fs.readFileSync(routerTmpFile).toString()

  fs.writeFileSync(pathFile, tmpContent)

  // 最后删除pages下面的router配置文件
  if (isExistSync(routerTmpFile)) fs.rmSync(routerTmpFile)
}
