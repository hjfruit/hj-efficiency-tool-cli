/** 将json转换为ES6模块 */
import json from '@rollup/plugin-json'
/** 引入package.json文件 */
import pkg from './package.json'
/** rollup解析及编译TS插件 */
import typescript from 'rollup-plugin-typescript2'
/** 解析代码中依赖的node_modules */
import resolve from '@rollup/plugin-node-resolve'
/** 将 CommonJS 模块转换为 ES6 的 Rollup 插件 */
import commonjs from '@rollup/plugin-commonjs'
/** rollup文件夹清除插件 */
import { cleandir } from 'rollup-plugin-cleandir'
/** 压缩代码 */
// import { terser } from 'rollup-plugin-terser'

export default {
  input: './lib/index.ts',
  output: {
    name: '2',
    file: pkg.main,
    banner: '#!/usr/bin/env node',
    format: 'umd',
  },
  plugins: [
    /** 配置插件 - 每次打包清除目标文件 */
    cleandir('./dist'),
    /** 配置插件 - 将json转换为ES6模块 */
    json(),
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    resolve({
      extensions: ['.js', '.ts', '.json'],
      modulesOnly: true,
      preferredBuiltins: false,
    }),
    commonjs({ extensions: ['.js', '.ts', '.json'] }),
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
}
