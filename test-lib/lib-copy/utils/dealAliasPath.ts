import path from 'path'

type configAliasType = Record<string, string>

const dealAliasPath = (
  filePath: string,
  configAlias: configAliasType = {
    '@': 'src',
  },
) => {
  const aliasKey = Object.keys(configAlias)[0]
  const aliasValue = configAlias[aliasKey]
  return path.join(process.cwd(), filePath.replace(aliasKey, aliasValue))
}

export default dealAliasPath
