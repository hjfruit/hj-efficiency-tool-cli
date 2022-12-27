import { Command } from 'commander'
import path from 'path'
import chalk from 'chalk'
import getConfig from '../utils/getConfig'
import getRoutePaths from '../utils/getRoutePaths'
import fs from 'fs'
import { CustomFile, FileType, ITmpConfig } from '../global'
import formatPath2Index from '../utils/formatPath2Index'
import isExistSync from '../utils/isExistSync'
import traverseChildrenFiles from '../utils/traverseChildrenFiles'
import getRoutePathLast from '../utils/getRoutePathLast'
import dealAliasPath from '../utils/dealAliasPath'

const program = new Command()

program
  .command('gen code')
  .description('gen template code')
  .option('-c, --custom', 'gen custom template code')
  .action((_, options) => {
    const configData = getConfig()
    const config = configData?.config as ITmpConfig

    if (options.custom) {
      try {
        if (!config.customFiles) {
          throw new Error('')
        }
        loadCustomFiles(config.customFiles)
      } catch {
        // eslint-disable-next-line no-console
        console.log(chalk.bgRed('Error: tmp.config.ts customFiles is not exits!'))
        process.exit(1)
      }
    } else {
      let configFiles: FileType[]
      try {
        if (!config.files) {
          throw new Error('')
        }
        configFiles = config.files || []
      } catch {
        // eslint-disable-next-line no-console
        console.log(chalk.bgRed('Error: tmp.config.ts files is not exits!'))
        process.exit(1)
      }

      let routes
      // 配置文件没有input时错误处理
      try {
        routes = getRoutePaths(config.input)
      } catch {
        // eslint-disable-next-line no-console
        console.log(
          chalk.bgRed('Error: tmp.config.ts input is not exits or is not correct!'),
        )
        process.exit(1)
      }

      const resolvePathRoutes = [
        ...new Set(routes.map((route) => dealAliasPath(route, config.alias))),
      ]
      resolvePathRoutes.forEach((val) => {
        const pathLast = getRoutePathLast(val)

        configFiles.forEach((file, index) => {
          try {
            if (!file.dirname) {
              throw new Error(`files: files[${index}] dirname is not exits`)
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log(chalk.bgRed(error))
            process.exit(1)
          }

          if (file.dirname === pathLast) {
            const tmpPath = formatPath2Index(
              val,
              file.filename ? file.filename : undefined,
            )
            if (!isExistSync(tmpPath)) {
              fs.mkdirSync(val, {
                recursive: true,
              })
              fs.writeFileSync(tmpPath, file.code ? file.code : '')
            }

            const childrenFiles = file?.childrenFiles
              ?.map((item) => {
                try {
                  return traverseChildrenFiles(item, val)
                } catch {
                  // eslint-disable-next-line no-console
                  console.log(
                    chalk.bgRed(
                      'Error: tmp.config.ts dirname is not exits or is not correct!',
                    ),
                  )
                  process.exit(1)
                }
              })
              ?.flat(1)

            iterateChildrenFilesGenCode(childrenFiles || [])
          }
        })
      })

      // eslint-disable-next-line no-console
      console.log(chalk.green('successful'))
    }

    // 处理自定义tmp.config
    function loadCustomFiles(customFiles: CustomFile) {
      for (const pathKey in customFiles) {
        const dirPath = dealAliasPath(pathKey, config.alias)
        const item = customFiles[pathKey]

        if (!isExistSync(dirPath)) {
          fs.mkdirSync(dirPath, {
            recursive: true,
          })
          if (item.code) {
            fs.writeFileSync(
              path.join(dirPath, item.filename ? item.filename : 'index.tsx'),
              item.code ? item.code : '',
            )
          }
        }

        const childrenCustomFiles = item?.childrenFiles
          ?.map((childFile) => {
            try {
              return traverseChildrenFiles(childFile, dirPath)
            } catch {
              // eslint-disable-next-line no-console
              console.log(
                chalk.bgRed(
                  'Error: tmp.config.ts dirname is not exits or is not correct!',
                ),
              )
              process.exit(1)
            }
          })
          .flat(1)

        iterateChildrenFilesGenCode(childrenCustomFiles || [])
      }

      // eslint-disable-next-line no-console
      console.log(chalk.green('customFiles successful'))
    }
  })

// 迭代childrenFiles生产code
const iterateChildrenFilesGenCode = (childrenFiles: FileType[]) => {
  childrenFiles.forEach((childCustomFile) => {
    if (childCustomFile?.filename) {
      if (!isExistSync(childCustomFile.dirname)) {
        fs.mkdirSync(childCustomFile.dirname, {
          recursive: true,
        })
        fs.writeFileSync(
          childCustomFile?.filename,
          childCustomFile.code ? childCustomFile.code : '',
        )
      }
    } else {
      if (!isExistSync(childCustomFile.dirname)) {
        fs.mkdirSync(childCustomFile.dirname, {
          recursive: true,
        })
        if (childCustomFile?.code) {
          // 这里默认“index.tsx”
          fs.writeFileSync(
            path.join(childCustomFile?.dirname, 'index.tsx'),
            childCustomFile.code ? childCustomFile.code : '',
          )
        }
      }
    }
  })
}

program.parse()
