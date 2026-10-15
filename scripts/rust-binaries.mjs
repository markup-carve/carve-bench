import {existsSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'

export function retainedRustDirectory(root, tree, profile = 'release') {
  if (!tree) return resolve(root, '.rust-artifacts/pinned', profile)
  const path = resolve(tree)
  let commit = ''
  try {commit = execFileSync('git', ['-C', path, 'rev-parse', 'HEAD'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim()} catch {}
  const key = createHash('sha256').update(path + '\n' + commit).digest('hex').slice(0, 24)
  return resolve(root, '.rust-artifacts/checkouts', key, profile)
}

export function rustBinary(root, {checkout = false, compare = false, env = process.env} = {}) {
  const explicit = env[compare ? 'CARVE_RS_COMPARE_BIN' : 'CARVE_RS_BIN']
  if (explicit) return resolve(explicit)
  const name = `carve-bench-rs${compare ? '-compare' : ''}`
  if (env.CARGO_TARGET_DIR || existsSync(resolve(root, '.rust-artifacts'))) return resolve(retainedRustDirectory(root,
    checkout ? typeof checkout === 'string' ? checkout : env.CARVE_RS_SRC : null), name)
  return resolve(root, 'engines/rs/target', checkout ? 'local-override/target/release' : 'release', name)
}
