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
    run('git', ['fetch', '--quiet', 'origin', pin.ref], dir)
    run('git', ['checkout', '--quiet', '--detach', pin.commit], dir)
  }
  const status = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: dir, encoding: 'utf8' })
  if (status !== '') throw new Error(`${name}: the checkout has local changes`)
  console.log(`${name} ${head(dir)}`)
}

// Carve 0.2 runs from the package build (dist/index.js, its public entry); the 0.1 release compiles to dist/ with tsc.
run('npm', ['ci', '--no-audit', '--no-fund', '--silent'], join(ENGINES, 'carve-js'))
const js01 = join(ENGINES, 'carve-js-0.1')
run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund', '--silent'], js01)
run('npx', ['tsc', '-p', 'tsconfig.json'], js01)
