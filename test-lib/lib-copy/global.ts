export type FileType = {
  dirname: string
  filename?: string
  code?: string
  childrenFiles?: FileType[]
}

export type CustomFile = {
  [k: string]: {
    code: string
    filename: string
    childrenFiles?: FileType[]
  }
}

export interface ITmpConfig {
  input: string | string[]
  alias?: Record<string, string>
  files: FileType[]
  customFiles?: CustomFile
}
