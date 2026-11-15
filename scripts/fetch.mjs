// Checks out every Carve engine at the commit pins.json names, into .engines/<repo>, and builds what needs a build.
//   node scripts/fetch.mjs
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const pins = JSON.parse(readFileSync(join(ROOT, 'pins.json'), 'utf8'))
const ENGINES = join(ROOT, '.engines')

function run(cmd, args, cwd) {
  execFileSync(cmd, args, { cwd, stdio: 'inherit' })
}

function head(dir) {
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim()
}

mkdirSync(ENGINES, { recursive: true })
for (const [name, pin] of Object.entries(pins)) {
  const dir = join(ENGINES, name)
  if (!existsSync(join(dir, '.git'))) run('git', ['clone', '--quiet', '--no-checkout', pin.url, dir], ROOT)
  if (existsSync(join(dir, '.git')) && head(dir) !== pin.commit) {
    run('git', ['fetch', '--quiet', 'origin', pin.branch], dir)
    run('git', ['checkout', '--quiet', '--detach', pin.commit], dir)
  }
  const status = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: dir, encoding: 'utf8' })
  if (status !== '') throw new Error(`${name}: the checkout has local changes`)
  console.log(`${name} ${head(dir)}`)
}

// The 0.1 JavaScript engine is published as compiled dist/; 0.2 (v2/src) runs as TypeScript source.
const js = join(ENGINES, 'carve-js')
run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--silent'], js)
run('npx', ['tsc', '-p', 'tsconfig.json'], js)
