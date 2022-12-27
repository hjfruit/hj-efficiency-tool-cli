import fs, { PathOrFileDescriptor } from 'fs'

type optionsType = {
  encoding?: null | undefined
  flag?: string | undefined
} | null

const readFile2Str = (path: PathOrFileDescriptor, options?: optionsType) => {
  const result = fs.readFileSync(path, options).toString()
  return result
}

export default readFile2Str
