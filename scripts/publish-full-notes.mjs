import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = file => readFileSync(resolve(root, file), 'utf8')
const full = JSON.parse(read('reports/dev-main-full.json'))
const controls = JSON.parse(read('reports/dev-main-full-output-controls.json')).latest_merged_main_output_checks
const phpRows = controls.rows.filter(row => row.engine === 'php')
assert.ok(phpRows.length > 0)
assert.ok(phpRows.every(row => row.commit === full.metadata.source_commits.php.commit), 'Output controls must match the published PHP pin')
const evidence = process.argv[2]
if (evidence) {
  assert.ok(evidence.startsWith('reports/') && evidence.endsWith('.md') && !evidence.includes('..') && existsSync(resolve(root, evidence)), 'Use an existing Markdown report under reports/')
  const diagnostic = JSON.parse(read(evidence.replace(/\.md$/, '.json')))
  for (const engine of ['js', 'php', 'rs'])
    assert.equal(diagnostic.metadata.sources.after[engine].commit, full.metadata.source_commits[engine].commit, 'Small-input evidence must use the published pins')
  for (const engine of ['js', 'php', 'rs']) {
    const rows = diagnostic.rows.filter(row => row.engine === engine && row.revision === 'after' && row.case === 'small')
    assert.ok(rows.length > 0, 'Evidence must include repeated small-input timings')
    assert.ok(rows.every(row => row.source_sha256 === full.metadata.input_sha256['corpus/small.crv']), 'Evidence must use the published small input')
  }
}
let markdown = read('RESULTS.md')
const jitNote = 'PHP output controls use a clean configuration without JIT, while these timings use tracing JIT.\nThe controls do not establish what every timed conversion rendered.\n'
const timedPhp = full.corpus.filter(row => row.engine === 'carve-php')
assert.ok(timedPhp.length > 0)
if (controls.php_flags.includes('opcache.enable_cli=0') && timedPhp.every(row => row.jit === true)) {
  if (!markdown.includes(jitNote)) {
    const anchor = 'before treating cross-engine results as equal work.\n'
    assert.ok(markdown.includes(anchor), 'Missing output-control paragraph')
    markdown = markdown.replace(anchor, anchor + jitNote)
  }
}
if (evidence) {
  markdown = markdown.replace(/^Small-input timings are unstable\.[^\n]*\n?/m, '')
  const start = markdown.indexOf('## small (')
  assert.ok(start >= 0, 'Missing small-input section')
  const end = markdown.indexOf('\n\n', start)
  assert.ok(end >= 0)
  const note = `Small-input timings are unstable. The [paired controls](${evidence}) record repeated timings for these same pins and input. These rows describe this run; their \`rel\` values do not establish stable engine speed ratios.`
  markdown = markdown.slice(0, end) + '\n\n' + note + markdown.slice(end).replace(/^\n+/, '\n\n')
}
writeFileSync(resolve(root, 'RESULTS.md'), markdown)
