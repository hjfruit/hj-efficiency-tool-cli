import chalk from 'chalk'
import ora from 'ora'

type spinnerType = {
  text: string
  type?: 'fail' | 'succeed' | 'start'
}

const spinner = ora()

export default function oraSpinner(params: spinnerType) {
  const { type = 'start', text } = params

  if (type === 'start') {
    return spinner.start(`${chalk.yellow(text)}`)
  }
  if (type === 'succeed') {
    return spinner.succeed(`${chalk.green(text)}`)
  }
  if (type === 'fail') {
    return spinner.fail(`${chalk.red(text)}`)
  }
}
