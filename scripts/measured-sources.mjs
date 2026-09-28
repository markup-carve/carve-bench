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

import { existsSync } from 'node:fs'
import { resolve, sep } from 'node:path'

// The wording all three harnesses use for a tree that is not a published
// release (`engines/js/carve-src.mjs`, `engines/php/carve-src.php`,
// `engines/rs/build.rs`).
const CHECKOUT = 'local checkout'

/**
 * The engine trees this environment asked for, one entry per override set.
 *
 * `CARVE_JS` doubles as a registry specifier, so only a filesystem path counts
 * as asking for a checkout; `@markup-carve/carve` asks for the npm package.
 */
export function requestedOverrides(env = process.env, root = process.cwd()) {
  const asked = []
  const add = (engine, variable, value) =>
    asked.push({ engine, variable, value, tree: resolve(root, value) })
  if (env.CARVE_JS && looksLikePath(env.CARVE_JS)) add('carve-js', 'CARVE_JS', env.CARVE_JS)
  if (env.CARVE_PHP_SRC) add('carve-php', 'CARVE_PHP_SRC', env.CARVE_PHP_SRC)
  if (env.CARVE_RS_SRC) add('carve-rs', 'CARVE_RS_SRC', env.CARVE_RS_SRC)
  return asked
}

/**
 * Every way the measured engines disagree with what was asked for.
 *
 * `sources` maps an engine name to the set of `carve_source` strings its rows
 * reported, which is what `run.mjs` and `compare.mjs` already collect for the
 * report's engine line.
 */
export function overrideProblems(sources, env = process.env, root = process.cwd()) {
  const problems = []
  for (const { engine, variable, value, tree } of requestedOverrides(env, root)) {
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
      const measured = source.match(/local checkout ([^,@)]+)/)?.[1]?.trim()
      if (!measured) {
        problems.push(
          `${variable} asked for ${tree}, but ${engine} reported \`${source}\`, ` +
            'which does not name the tree it measured',
        )
        continue
      }
      if (!related(resolve(measured), tree)) {
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

function looksLikePath(spec) {
  return spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('~') || existsSync(spec)
}

// A reported package root and a requested tree need not be the same directory:
// CARVE_PHP_SRC names a checkout's `src/`, CARVE_JS names a built entry point,
// and both report the package root above them.
function related(a, b) {
  return a === b || a.startsWith(b + sep) || b.startsWith(a + sep)
}
