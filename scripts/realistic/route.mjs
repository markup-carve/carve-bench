import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const [tree, fixture] = process.argv.slice(2)
const { tryFastHtmlWithStats } = await import(pathToFileURL(`${tree}/dist/fast-html.js`))
const source = readFileSync(fixture, 'utf8')
console.log(tryFastHtmlWithStats(source, {}) === undefined ? 'ast' : 'direct')
