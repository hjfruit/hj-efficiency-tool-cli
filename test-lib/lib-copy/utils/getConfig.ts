import { cosmiconfigSync, defaultLoaders } from 'cosmiconfig'
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader'
import { CONFIG_FILE_NAME } from '../const'

const getConfig = () => {
  const explorerSync = cosmiconfigSync('tmp', {
    searchPlaces: [CONFIG_FILE_NAME],
    loaders: {
      ...defaultLoaders,
      '.ts': TypeScriptLoader(),
    },
  })
  const searchedFor = explorerSync.search()

  return searchedFor
}

export default getConfig
