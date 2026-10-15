import {createHash} from 'node:crypto'
import {existsSync, readFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {homedir} from 'node:os'

export function rustSettings() {
  const files = new Set()
  let directory = process.cwd()
  while (true) {
    for (const name of ['config', 'config.toml']) files.add(resolve(directory, '.cargo', name))
    const parent = dirname(directory)
    if (parent === directory) break
    directory = parent
  }
  for (const name of ['config', 'config.toml']) files.add(resolve(process.env.CARGO_HOME ?? resolve(homedir(), '.cargo'), name))
  return {environment: Object.fromEntries(Object.entries(process.env).filter(([name]) => /^(RUST|CARGO_(ENCODED_RUSTFLAGS|PROFILE_|BUILD_|TARGET_(?!DIR$)))/.test(name)).sort()),
    cargoConfigurationSha256: Object.fromEntries([...files].filter(existsSync).sort().map(file => [file, createHash('sha256').update(readFileSync(file)).digest('hex')]))}
}
