// Writes build/documents: the stored documents plus the 1mb document of each language, and list.txt in run order.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
export const NAMES = ['commonmark-core', 'prose', 'lists-tables', 'reference-heavy']
export const LANGS = ['crv', 'md', 'dj']
const TARGET = 1_000_000

export function writeDocuments(out = join(ROOT, 'build/documents')) {
  mkdirSync(out, { recursive: true })
  for (const lang of LANGS) {
    const parts = NAMES.map((name) => readFileSync(join(ROOT, 'documents', `${name}.${lang}`), 'utf8'))
    for (const [at, text] of parts.entries()) writeFileSync(join(out, `${NAMES[at]}.${lang}`), text)
    const unit = parts.map((text) => (text.endsWith('\n') ? text : text + '\n')).join('\n')
    const copies = Math.ceil(TARGET / Buffer.byteLength(unit))
    writeFileSync(join(out, `1mb.${lang}`), Array(copies).fill(unit).join('\n'))
  }
  writeFileSync(join(out, 'list.txt'), [...NAMES, '1mb'].join('\n') + '\n')
  return out
}

if (process.argv[1] === import.meta.filename) console.log(writeDocuments())
