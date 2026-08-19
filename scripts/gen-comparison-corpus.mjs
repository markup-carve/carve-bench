// Generate equivalent ~48 KiB documents in Carve, Djot and Markdown syntax.
// The feature mix follows the methodology published in carve/docs/performance.md.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const out = resolve(root, 'corpus/comparison')
const targetBytes = 48 * 1024

const section = (i, flavor) => {
  const strong = flavor === 'carve' ? '*strong*' : '**strong**'
  const emphasis = flavor === 'carve' ? '/emphasis/' : '*emphasis*'
  return `## Section ${i}

Paragraph ${i} has ${strong}, ${emphasis}, \`inline code\`, and a [link][site].

- first list item
- second list item
  - nested item with ${strong}
  - another nested item

> A block quote with ${emphasis} and a [direct link](https://example.com/path).

\`\`\`js
function section${i}(value) {
  return value + ${i};
}
\`\`\`

| Name | Value | Note |
| --- | ---: | :--- |
| alpha | ${i} | ${strong} |
| beta | ${i + 1} | \`code\` |

`
}

for (const flavor of ['carve', 'djot', 'markdown']) {
  let source = `# Cross-language render benchmark

[site]: https://example.com "Example"

`
  let i = 1
  while (Buffer.byteLength(source) < targetBytes) source += section(i++, flavor)
  mkdirSync(out, { recursive: true })
  const extension = flavor === 'markdown' ? 'md' : flavor === 'carve' ? 'crv' : 'dj'
  writeFileSync(resolve(out, `${flavor}.${extension}`), source)
  console.log(`${flavor}: ${Buffer.byteLength(source)} bytes, ${i - 1} sections`)
}
