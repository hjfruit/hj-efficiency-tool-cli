declare module 'download-git-repo' {
  export default function download(
    url: string,
    dirname: string,
    object: { clone: boolean },
    callback: (err: string) => void,
  ): void

  export type PromptType = {
    type: string
    name: string
    message: string
    choices: string[]
  }
}
