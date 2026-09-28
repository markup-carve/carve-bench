// Fails a run that did not measure the tree the caller asked for.
//
// Every harness reports the engine it resolved as `carve_source`, and the
// reports name it - but nothing compared that reading against the override the
// operator set, so a run could ask for a checkout, measure the published
// release, and write a report that named the release without anyone noticing
// they had asked for something else. carve-bench#19 is that failure on the Rust
// lane: the documented `[patch]` was refused for a version mismatch, cargo
// warned and exited 0, and the report named crates.io 0.1.6 while the caller
// believed they were measuring the working tree.
//
// So an override is a claim the run has to honor. Asking for a checkout and
// measuring anything else is a failed run, not a footnote.

import { existsSync, realpathSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// The wording all three harnesses use for a tree that is not a published
// release (`engines/js/carve-src.mjs`, `engines/php/carve-src.php`,
// `engines/rs/build.rs`).
const CHECKOUT = 'local checkout'

/**
 * The engine trees this environment asked for, one entry per override set.
 *
 * A relative override is resolved the way its own consumer resolves it, or the
 * check would look somewhere the harness never did: `CARVE_JS` is an import
 * specifier inside `engines/js/`, while PHP reads `CARVE_PHP_SRC` and the Rust
 * build wrapper reads `CARVE_RS_SRC` in the directory the run was started from.
 *
 * `CARVE_JS` doubles as a registry specifier, so only a filesystem path counts
 * as asking for a checkout; `@markup-carve/carve` asks for the npm package.
 *
 * `exact` marks a lane that reports the checkout root itself, where nothing
 * below it is the tree that was named.
 */
export function requestedOverrides(env = process.env, root = process.cwd(), cwd = process.cwd()) {
  const asked = []
  const add = (engine, variable, value, tree, exact = false) =>
    asked.push({ engine, variable, value, tree, exact })
  const js = env.CARVE_JS ? jsTree(env.CARVE_JS, join(root, 'engines/js')) : null
  if (js) add('carve-js', 'CARVE_JS', env.CARVE_JS, js)
  if (env.CARVE_PHP_SRC) add('carve-php', 'CARVE_PHP_SRC', env.CARVE_PHP_SRC, resolve(cwd, env.CARVE_PHP_SRC))
  if (env.CARVE_RS_SRC) add('carve-rs', 'CARVE_RS_SRC', env.CARVE_RS_SRC, resolve(cwd, env.CARVE_RS_SRC), true)
  return asked
}

/**
 * Every way the measured engines disagree with what was asked for.
 *
 * `sources` maps an engine name to the set of `carve_source` strings its rows
 * reported, which is what `run.mjs` and `compare.mjs` already collect for the
 * report's engine line.
 */
export function overrideProblems(sources, env = process.env, root = process.cwd(), cwd = process.cwd()) {
  const problems = []
  for (const { engine, variable, value, tree, exact } of requestedOverrides(env, root, cwd)) {
    if (!existsSync(tree)) {
      problems.push(`${variable}=${value} names ${tree}, which does not exist`)
      continue
    }
    const seen = [...(sources.get(engine) ?? [])]
    if (seen.length === 0) {
      problems.push(
        `${variable} asked for ${tree}, but ${engine} reported no carve_source, ` +
          'so nothing says which tree ran',
      )
      continue
    }
    for (const source of seen) {
      if (!source.includes(CHECKOUT)) {
        problems.push(`${variable} asked for ${tree}, but ${engine} measured \`${source}\``)
        continue
      }
      const measured = measuredTree(source)
      if (!measured) {
        problems.push(
          `${variable} asked for ${tree}, but ${engine} reported \`${source}\`, ` +
            'which does not name the tree it measured',
        )
        continue
      }
      if (!(exact ? same(resolve(measured), tree) : related(resolve(measured), tree))) {
        problems.push(
          `${variable} asked for ${tree}, but ${engine} measured the checkout at ${measured}`,
        )
      }
    }
  }
  return problems
}

/** Report the problems and stop the run before any report is written. */
export function assertMeasuredSources(sources, env = process.env, root = process.cwd()) {
  const problems = overrideProblems(sources, env, root)
  if (problems.length === 0) return
  console.error(
    `\nthis run did not measure the trees it was asked for:\n  ${problems.join('\n  ')}\n\n` +
      'No report was written, because a report that names an engine the run did not\n' +
      'use is worse than no report. Build the Rust harness for a checkout with\n' +
      '`node scripts/build-rs-engine.mjs --carve-rs <path>`; see README, "Engine resolution".',
  )
  process.exit(1)
}

/**
 * The directory a `carve_source` line says it measured, or null when it names no
 * directory at all.
 *
 * Every producer writes `<package> [<version>] (<origin>)`, so the origin is the
 * parenthesized tail and a path is whatever follows `local checkout ` inside it,
 * minus the revision the harnesses append. Nothing in a path is treated as a
 * delimiter: `@`, `,` and `)` are all legal in a directory name, and truncating
 * at one would fail a run that measured exactly what it was asked to.
 */
function measuredTree(source) {
  const opens = source.indexOf(' (')
  const origin = opens >= 0 && source.endsWith(')') ? source.slice(opens + 2, -1) : source
  if (!origin.startsWith(`${CHECKOUT} `)) return null
  const tree = origin.slice(CHECKOUT.length + 1).replace(/ @ [0-9a-f]{7,40}$/, '').trim()
  return tree || null
}

/**
 * The checkout a `CARVE_JS` value names, or null when it names a package.
 *
 * It is an import specifier, so a bare name is the registry and a relative path
 * is relative to the harness that imports it. A `file:` URL is equally valid
 * there, and reading it as a package specifier would leave that lane unchecked.
 */
function jsTree(spec, base) {
  if (spec.startsWith('file:')) {
    try {
      return fileURLToPath(spec)
    } catch {
      return null
    }
  }
  return looksLikePath(spec) ? resolve(base, spec) : null
}

function looksLikePath(spec) {
  return spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('~') || existsSync(spec)
}

// A reported package root and a requested tree need not be the same directory:
// CARVE_PHP_SRC names a checkout's `src/`, CARVE_JS names a built entry point,
// and both report the package root above them. Containment is as far as that
// allowance goes: a lane reporting the root itself gets `same` instead, so a
// nested worktree cannot pass for the tree above it.
function related(a, b) {
  const [x, y] = [canonical(a), canonical(b)]
  return x === y || x.startsWith(y + sep) || y.startsWith(x + sep)
}

function same(a, b) {
  return canonical(a) === canonical(b)
}

// Spelling one side through a symlink is not a different tree, and only one side
// is usually spelled that way: a harness reports the package root it resolved,
// which is canonical, while the override names a path the operator typed. A
// measured tree that is no longer on this machine keeps the name it was given.
function canonical(path) {
  try {
    return realpathSync(path)
  } catch {
    return path
  }
}
