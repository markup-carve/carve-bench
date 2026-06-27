// Build the benchmark documents from a Carve spec checkout's corpus.
// Usage: CARVE_REPO=../carve node scripts/gen-corpus.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const carveRepo = process.env.CARVE_REPO ?? resolve(root, '../carve')
const corpusDir = resolve(carveRepo, 'tests/corpus')

const blocks = readdirSync(corpusDir)
  .filter((f) => f.endsWith('.crv'))
  .sort()
  .map((f) => readFileSync(resolve(corpusDir, f), 'utf8').trimEnd())

const medium = blocks.join('\n\n') + '\n'
const small = blocks.slice(0, 40).join('\n\n') + '\n'
const large = Array.from({ length: 8 }, () => medium).join('\n\n') + '\n'

const out = resolve(root, 'corpus')
const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB'
for (const [name, text] of [['small', small], ['medium', medium], ['large', large]]) {
  writeFileSync(resolve(out, `${name}.crv`), text)
  console.log(`${name}.crv  ${kb(text)}`)
}
