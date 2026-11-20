// Creates or updates the tracking issue for a failed perf gate run.
// node perf/issue.mjs --verdict verdict.json --report report.md --repo owner/name
//   [--previous verdict.json]  verdict of the last green run (engine commit range starts there)
//   [--find-previous]          look the last green run up with gh (workflow perf-nightly.yml)
//   [--run-url url]            link to this run
//   [--dry-run]                print the issue instead of writing it
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
const argv = process.argv.slice(2)
const opt = name => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined }
const flag = name => argv.includes(`--${name}`)
const dry = flag('dry-run'), repo = opt('repo')
if (!opt('verdict') || !opt('report') || !repo) throw new Error('usage: issue.mjs --verdict v.json --report r.md --repo owner/name [--previous v.json] [--find-previous] [--run-url url] [--dry-run]')
const v = JSON.parse(fs.readFileSync(opt('verdict'), 'utf8'))
if (v.pass) { console.log('perf gate passed; no issue'); process.exit(0) }
const gh = (...a) => execFileSync('gh', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })

function findPrevious() {
  try {
    const runs = JSON.parse(gh('run', 'list', '--repo', repo, '--workflow', 'perf-nightly.yml', '--status', 'success', '--limit', '20', '--json', 'databaseId'))
    for (const { databaseId } of runs) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'perf-prev-'))
      try { gh('run', 'download', String(databaseId), '--repo', repo, '--name', 'perf-report', '--dir', dir) } catch { continue }
      const p = path.join(dir, 'verdict.json')
      if (!fs.existsSync(p)) continue
      const prev = JSON.parse(fs.readFileSync(p, 'utf8'))
      if (prev.pass && prev.ref === v.ref) return { ...prev, runId: databaseId }
    }
  } catch (e) { console.error(`previous green run lookup failed: ${e.message}`) }
  return undefined
}
const prev = opt('previous') ? JSON.parse(fs.readFileSync(opt('previous'), 'utf8')) : flag('find-previous') ? findPrevious() : undefined

const title = `Perf gate: regression on ${v.ref}`
const report = fs.readFileSync(opt('report'), 'utf8')
const summary = report.split('<details>')[0].trim()
const range = ['js', 'php', 'rs'].map(e => {
  const now = v.heads[e].commit, was = prev?.heads?.[e]?.commit
  const r = `markup-carve/carve-${e}`
  if (!was) return `- carve-${e}: \`${now.slice(0, 8)}\` (no earlier green run on record)`
  if (was === now) return `- carve-${e}: \`${now.slice(0, 8)}\`, unchanged since the last green run`
  return `- carve-${e}: [\`${was.slice(0, 8)}...${now.slice(0, 8)}\`](https://github.com/${r}/compare/${was}...${now})`
})
const body = [summary, '',
  `## Engine commits since the last green run${prev ? ` (${prev.started})` : ''}`, '', ...range, '',
  opt('run-url') ? `Run: ${opt('run-url')}` : '', '',
  'The nightly perf gate updates this issue while it fails. Close it once the gate passes again.', ''].join('\n')

let existing
try {
  existing = JSON.parse(gh('issue', 'list', '--repo', repo, '--state', 'open', '--search', `"${title}" in:title`, '--json', 'number,title'))
    .find(i => i.title === title)
} catch (e) {
  if (!dry) throw e
  console.error(`issue lookup skipped: ${e.message.split('\n')[0]}`)
}
const bodyFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'perf-issue-')), 'body.md')
fs.writeFileSync(bodyFile, body)
const cmds = existing
  ? [['issue', 'edit', String(existing.number), '--repo', repo, '--body-file', bodyFile],
      ['issue', 'comment', String(existing.number), '--repo', repo, '--body', `Still failing${opt('run-url') ? `: ${opt('run-url')}` : ''} (${v.failures.length} failures).`]]
  : [['issue', 'create', '--repo', repo, '--title', title, '--body-file', bodyFile, '--label', 'bug', '--label', 'area:tooling']]
if (dry) {
  console.log(`DRY RUN: would run\n${cmds.map(c => `  gh ${c.map(a => a.includes(' ') ? JSON.stringify(a) : a).join(' ')}`).join('\n')}\n\n--- title ---\n${title}\n--- body ---\n${body}`)
} else {
  for (const c of cmds) console.log(gh(...c).trim())
}
