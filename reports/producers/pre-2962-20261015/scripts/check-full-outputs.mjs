import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { validateFullReportSources } from './full-results.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const config = JSON.parse(readFileSync(process.argv[2]))
const binary = resolve(root, 'engines/rs/target/local-override/target/release/carve-bench-rs')
const env = { ...process.env, CARVE_JS: resolve(config.js.path, 'dist/index.js'), CARVE_PHP_SRC: resolve(config.php.path, 'src'), CARVE_RS_SRC: config.rs.path }
const { sourceCommits } = validateFullReportSources(root, binary, env)
for (const engine of ['js', 'php', 'rs']) assert.equal(sourceCommits[engine].commit, config[engine].commit)
const { carveToHtml } = await import(pathToFileURL(env.CARVE_JS))
const sha = data => createHash('sha256').update(data).digest('hex')
const phpFlags = ['-n', '-d', 'extension=ctype', '-d', 'extension=' + (process.env.CARVE_PHP_MBSTRING ?? 'mbstring'), '-d', 'memory_limit=512M', '-d', 'opcache.enable_cli=0']
const rows = []
for (const engine of ['js', 'php', 'rs']) {
  for (const size of ['small', 'medium', 'large']) {
    const file = resolve(root, `corpus/${size}.crv`)
    let result
    if (engine === 'js') {
      const html = carveToHtml(readFileSync(file, 'utf8'))
      result = { output_bytes: Buffer.byteLength(html), output_sha256: sha(html) }
    } else if (engine === 'php') {
      result = JSON.parse(execFileSync('php', [...phpFlags, resolve(root, 'scripts/full-output-control.php'), file], { env, encoding: 'utf8', maxBuffer: 16000000, timeout: 300000 }))
    } else {
      const record = JSON.parse(execFileSync(`${binary}-compare`, ['carve-rs', file, '1', '1'], { env, encoding: 'utf8', maxBuffer: 16000000, timeout: 300000 }))
      assert.ok(record.carve_source.includes(config.rs.commit.slice(0, 9)), 'Rust control binary must match the pinned commit')
      const html = Buffer.from(record.output_hex, 'hex')
      result = { output_bytes: html.length, output_sha256: sha(html), control_binary_sha256: sha(readFileSync(`${binary}-compare`)), measured_binary_sha256: sha(readFileSync(binary)) }
    }
    if (engine === 'php') assert.equal(resolve(result.source_file), resolve(config.php.path, 'src/CarveConverter.php'))
    delete result.source_file
    rows.push({ ...result, engine, size, commit: config[engine].commit, source_sha256: sha(readFileSync(file)) })
  }
}
const path = resolve(root, 'reports/dev-main-full-output-controls.json')
const control = JSON.parse(readFileSync(path))
control.note = 'Historical output checks and the paired Rust control retain their original commits. The latest_merged_main_output_checks section records the pinned sources and its capture date. Mixed-corpus outputs can differ across engines and versions; elapsed times need not compare identical output bytes.'
const producer_sha256 = Object.fromEntries(['scripts/check-full-outputs.mjs', 'scripts/full-output-control.php'].map(file => [file, sha(readFileSync(resolve(root, file)))]))
control.latest_merged_main_output_checks = { generated_at: new Date().toISOString(), producer_sha256, php_flags: phpFlags, note: 'Default conversion outputs for the pinned merged main commits. PHP uses a clean configuration without JIT and a 512 MiB memory limit. These are separate output controls, not hashes of every timed conversion. Historical release checks and the earlier paired Rust control remain unchanged.', rows }
writeFileSync(path, JSON.stringify(control, null, 2) + '\n')
