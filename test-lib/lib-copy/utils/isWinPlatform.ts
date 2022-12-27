import os from 'os'

const isWinPlatform = () => os.platform().includes('win')

export default isWinPlatform
