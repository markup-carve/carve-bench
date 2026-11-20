// Prepares a perf gate run: installs the pinned baselines from config.json, builds the engine
// checkouts and the Rust driver, generates the corpus, and writes <work>/setup.json for orch.mjs.
//
// node perf/setup.mjs --js <carve-js> --php <carve-php> --rs <carve-rs> [--work perf/.work]
//   [--no-engine-build]   skip npm/composer in the checkouts (already built)
//   [--rs-manifest-only]  only write the Rust driver manifest (CI runs it before restoring the cache)
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
const H = path.dirname(new URL(import.meta.url).pathname)
const argv = process.argv.slice(2)
const opt = name => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined }
const flag = name => argv.includes(`--${name}`)
const abs = p => p && path.resolve(p)
const work = abs(opt('work') || path.join(H, '.work'))
const engines = { js: abs(opt('js')), php: abs(opt('php')), rs: abs(opt('rs')) }
for (const [k, v] of Object.entries(engines)) if (!v || !fs.existsSync(v)) throw new Error(`--${k} <checkout> is required (got ${v})`)
const config = JSON.parse(fs.readFileSync(path.join(H, 'config.json'), 'utf8'))
const base = config.baseline
const run = (cmd, args, cwd) => { console.error(`$ (${path.relative(process.cwd(), cwd) || '.'}) ${cmd} ${args.join(' ')}`); execFileSync(cmd, args, { cwd, stdio: ['ignore', 'inherit', 'inherit'] }) }
const git = (dir, ...a) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8' }).trim()
fs.mkdirSync(work, { recursive: true })

// Rust driver manifest: the checkout as `head`, the pinned release crate as `base`.
const rsDir = path.join(work, 'rs')
fs.mkdirSync(rsDir, { recursive: true })
const toml = s => JSON.stringify(s)
fs.writeFileSync(path.join(rsDir, 'Cargo.toml'), `[package]
name = "perf-carve-rs"
version = "0.0.0"
edition = "2021"
publish = false

[workspace]

[[bin]]
name = "perf-carve-rs"
path = ${toml(path.join(H, 'drivers/rs/src/main.rs'))}

[features]
base-api-01 = []

[dependencies]
head = { package = ${toml(base.rs.crate)}, path = ${toml(engines.rs)} }
base = { package = ${toml(base.rs.crate)}, version = ${toml('=' + base.rs.version)} }
serde_json = "1"

[profile.release]
lto = "thin"
codegen-units = 1
`)
if (flag('rs-manifest-only')) process.exit(0)

if (!flag('no-engine-build')) {
  run('npm', ['ci', '--no-audit', '--no-fund'], engines.js)
  run('npm', ['run', 'build'], engines.js)
  run('composer', ['install', '--no-dev', '--no-interaction', '--prefer-dist'], engines.php)
}

const baseJs = path.join(work, 'base-js')
fs.mkdirSync(baseJs, { recursive: true })
fs.writeFileSync(path.join(baseJs, 'package.json'), JSON.stringify({ private: true, dependencies: { [base.js.package]: base.js.version } }, null, 2) + '\n')
run('npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts'], baseJs)
const basePhp = path.join(work, 'base-php')
fs.mkdirSync(basePhp, { recursive: true })
fs.writeFileSync(path.join(basePhp, 'composer.json'), JSON.stringify({ require: { [base.php.package]: base.php.version }, config: { 'optimize-autoloader': true } }, null, 2) + '\n')
run('composer', ['update', '--no-dev', '--no-interaction', '--prefer-dist'], basePhp)

const features = base.api === '0.1' ? ['--features', 'base-api-01'] : []
run('cargo', ['build', '--release', ...features], rsDir)
const target = process.env.CARGO_TARGET_DIR ? path.resolve(process.env.CARGO_TARGET_DIR) : path.join(rsDir, 'target')

const baseJsDist = path.join(baseJs, 'node_modules', base.js.package, 'dist')
const corpus = path.join(work, 'corpus')
run('node', [path.join(H, 'gen.mjs'), corpus, baseJsDist], H)

const installed = JSON.parse(fs.readFileSync(path.join(baseJs, 'node_modules', base.js.package, 'package.json'), 'utf8')).version
const phpLock = JSON.parse(fs.readFileSync(path.join(basePhp, 'composer.lock'), 'utf8')).packages.find(p => p.name === base.php.package)
const setup = {
  corpus,
  head: Object.fromEntries(Object.entries(engines).map(([k, dir]) => [k, { dir, commit: git(dir, 'rev-parse', 'HEAD'), ref: git(dir, 'describe', '--always', '--all') }])),
  baseline: { label: base.label, api: base.api, js: installed, php: phpLock.version.replace(/^v/, ''), rs: base.rs.version },
  drivers: {
    js: { head: path.join(engines.js, 'dist'), base: baseJsDist },
    php: { head: path.join(engines.php, 'vendor/autoload.php'), base: path.join(basePhp, 'vendor/autoload.php') },
    rs: { bin: path.join(target, 'release/perf-carve-rs'), rules: path.join(engines.rs, 'spec-data/lint-rules.json') },
  },
}
fs.writeFileSync(path.join(work, 'setup.json'), JSON.stringify(setup, null, 2) + '\n')
console.error(`setup: ${path.join(work, 'setup.json')}`)
