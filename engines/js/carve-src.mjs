// Resolved carve-js identity for the two JS harnesses.
//
// The engine is selected by CARVE_JS (a path or a bare specifier) and defaults
// to the published npm package, so a run has to be able to say which of those
// it actually loaded. `describeCarveSource` resolves the specifier the same way
// the harness imports it and reports the package it landed in, distinguishing a
// node_modules install from a checkout - a checkout's package.json usually
// still carries the last released version number, so the version alone cannot
// tell them apart.
//
// Every harness reports the result as `carve_source`; check it before accepting
// a number.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_WALK = 12

export function describeCarveSource(spec, resolved) {
  if (!resolved) return `${spec} (unresolved)`
  let file
  try {
    file = fileURLToPath(resolved)
  } catch {
    return `${spec} (${resolved})`
  }
  const installed = file.split(sep).includes('node_modules')
  let dir = dirname(file)
  for (let step = 0; step < MAX_WALK && dir !== dirname(dir); step++) {
    const manifest = join(dir, 'package.json')
    if (existsSync(manifest)) {
      try {
        const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
        if (pkg.version) {
          const name = pkg.name ?? spec
          return installed
            ? `${name} ${pkg.version} (npm package)`
            : `${name} ${pkg.version} (local checkout ${dir}${headOf(dir)})`
        }
      } catch {
        // An unreadable manifest is not fatal - keep walking upward.
      }
    }
    dir = dirname(dir)
  }
  return `${spec} (${file})`
}

// Best-effort short revision of a checkout. A missing git, a tarball, or a
// detached worktree all just leave the revision off rather than failing a run.
function headOf(dir) {
  try {
    const rev = execFileSync('git', ['-C', dir, 'rev-parse', '--short', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return rev ? ` @ ${rev}` : ''
  } catch {
    return ''
  }
}
