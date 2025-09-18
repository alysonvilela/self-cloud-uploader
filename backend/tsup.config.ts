import type { Options } from 'tsup'
import { spawnSync } from 'node:child_process'

export const tsup: Options = {
  entry: ['src/**/*.ts'],
  dts: false,
  async onSuccess() {
    spawnSync('tsc', ['--emitDeclarationOnly', '--declaration'])
  },
  tsconfig: './tsconfig.json',
}
