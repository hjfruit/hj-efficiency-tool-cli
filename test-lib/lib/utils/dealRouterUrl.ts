import path from 'path'

type configAliasType = Record<string, string>

const dealRouterUrl = (
  filePath: string,
  configAlias: configAliasType = {
    '@': 'src',
  },
  basename = '',
) => {
  const aliasKey = Object.keys(configAlias)[0]
  const aliasValue = configAlias[aliasKey]
  return path.join(process.cwd(), filePath.replace(aliasKey, aliasValue), basename)
}

export default dealRouterUrl
