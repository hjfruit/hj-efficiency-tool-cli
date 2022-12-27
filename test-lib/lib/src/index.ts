import path from 'path'
import fs from 'fs'
import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import download, { PromptType } from 'download-git-repo'
import isWinPlatform from '../utils/isWinPlatform'
import createSourceFiles from '../utils/createSourceFiles'
import walkSync from '../utils/walkSync'
import getRouterUrls from '../utils/getRouterUrls'
import dealRouterUrl from '../utils/dealRouterUrl'
import isExistSync from '../utils/isExistSync'
import getTmpChoices from '../utils/getTmpChoices'

const program = new Command()

program
  .command('gen-tmp-code [input]')
  .description('gen template code')
  .option('-r, --remote [gitUrl]', '文件生成位置')
  .action((input, { remote }) => {
    if (!remote) {
      // eslint-disable-next-line no-console
      console.log(chalk.bgRed('缺少模板代码仓库的远程地址'))
      process.exit(1)
    }

    // 获取整个路由下面的所有路径
    const resultPaths: string[] = []
    const inputPath = input ?? 'src/router/config'
    walkSync(path.join(process.cwd(), inputPath), (filePath) => {
      resultPaths.push(filePath)
    })

    const routeFiles = getRouterFilePaths(resultPaths)
    const sourceFiles = createSourceFiles(routeFiles)
    const routerUrls = getRouterUrls(sourceFiles)
    const resolveRouterUrls = routerUrls.map((url) => dealRouterUrl(url))
    // 得到不存在的文件路径,指的就是本次新增的模块的路径
    const notExistFilePaths = resolveRouterUrls.filter((file) => !isExistSync(file))
    // 去重得到最终需要的全部的绝对路径
    const absoluteFilePaths = [...new Set(notExistFilePaths)]

    const dirs = getDir(absoluteFilePaths)

    /* eslint-disable no-console */
    if (dirs.length === 0) {
      console.log(chalk.bgRed('不存在新增模块路径!'))
      process.exit(1)
    }

    // 获取模板string数组
    const tmpChoices = getTmpChoices(remote)

    const promptList = dirs.map((dir) => {
      const cwd = path.join(process.cwd(), isWinPlatform() ? '\\' : '/')
      const pathName = dir.split(cwd)[1]
      return {
        type: 'list',
        name: pathName,
        message: `请选择【${pathName}】对应模版名称`,
        choices: tmpChoices,
      }
    })

    // TODO 逐步询问下载方式
    const sleep = (data: PromptType) => {
      return new Promise(function (resolve, reject) {
        inquirer.prompt([data]).then((answer) => {
          for (const key in answer) {
            const fileUrl = path.join(process.cwd(), key)
            const branchName = answer[key]

            download(
              'direct:' + remote + '#' + branchName,
              fileUrl,
              { clone: true },
              (err: string) => {
                if (err) {
                  reject(err)
                } else {
                  // 创建对应的gql文件
                  createGqlFile(fileUrl)
                  resolve('success!')
                }
              },
            )
          }
        })
      })
    }

    const start = async () => {
      for (let i = 0; i < promptList.length; i++) {
        try {
          const result = await sleep(promptList[i])
          console.log(chalk.bgGreenBright(result))
        } catch (error) {
          console.log(chalk.bgRedBright(error))
        }
      }
    }
    start()

    // TODO 一次性询问完毕一起下载方式
    // inquirer.prompt(promptList).then((answer) => {
    //   for (const key in answer) {
    //     const fileUrl = path.join(process.cwd(), key)
    //     const branchName = answer[key]

    //     download(
    //       gitRepoUrl + '#' + branchName,
    //       fileUrl,
    //       { clone: true },
    //       (err: string) => {
    //         if (err) {
    //           console.log(chalk.bgRedBright(err))
    //           process.exit()
    //         } else {
    //           console.log(chalk.bgGreenBright(`【${key}】success!`))
    //         }
    //       },
    //     )
    //   }
    // })
  })

program.parse()

// 获取过滤路径之后的最终需要的路由路径
function getRouterFilePaths(paths: string[]) {
  return paths
    ?.map((pathItm) => {
      const pathItmArr = isWinPlatform() ? pathItm.split('\\') : pathItm.split('/')
      const isLastIndexTsx = pathItmArr[pathItmArr.length - 1] === 'index.tsx'
      if (isLastIndexTsx) return pathItm
      return ''
    })
    .filter(Boolean)
}

// 获取到文件目录层路径，为了在该层目录下拉取仓库代码
function getDir(absoluteFilePaths: string[]) {
  const resultFileList = [] as string[]
  absoluteFilePaths.forEach((file) => {
    const fileList = isWinPlatform() ? file.split('\\') : file.split('/')
    let loop = fileList.length

    while (loop--) {
      const tmpFileList = fileList.slice(0, loop)
      const tmpFilePath = isWinPlatform() ? tmpFileList.join('\\') : tmpFileList.join('/')
      if (isExistSync(tmpFilePath)) {
        const num = loop + 1
        resultFileList.push(
          isWinPlatform()
            ? fileList.slice(0, num).join('\\')
            : fileList.slice(0, num).join('/'),
        )
        break
      } else {
        continue
      }
    }
  })
  // 去重
  return [...new Set(resultFileList)]
}

// 根据绝对路径创建对应的gql文件
function createGqlFile(dir: string) {
  const gqlFile =
    dir.replace('pages', isWinPlatform() ? 'graphql\\operations' : 'graphql/operations') +
    '.gql'

  if (isExistSync(gqlFile)) return

  fs.writeFileSync(gqlFile, '')
}
