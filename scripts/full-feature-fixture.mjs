export const fullFeatureSizes = [128, 512]

export function fullFeatureSource(sections) {
  if (!Number.isInteger(sections) || sections < 1) throw new Error('Positive section count required')
  const blocks = ['# full-feature benchmark\n']
  for (let i = 0; i < sections; i++) {
    blocks.push(`## section-${i}

A paragraph with *bold*, /italic/, _underline_, ~strike~, =highlight=,
{^superscript^}, {,subscript,}, \`inline code\` and [a link](https://example.test/${i}).
This paragraph refers to note [^note-${i}].

> A quotation with *bold text*.
>
> A second paragraph in the quotation.

- first item
- second item

  - nested item

:: term-${i}
: A definition with /italic text/.

| name | value |
|:-----|------:|
| alpha | 12 |
| beta | 34 |

\`\`\`text
Closed code block; delimiters here are ordinary payload.
*bold* /italic/ <tag>
\`\`\`

\`\`\`=html
<span class="raw">raw block</span>
\`\`\`

[^note-${i}]: Footnote text with *bold text*.
`)
  }
  return blocks.join('\n')
}

export function requireFullFeatureOutput(html) {
  for (const tag of ['strong', 'em', 'u', 's', 'mark', 'sup', 'sub', 'blockquote', 'ul', 'dl', 'table', 'pre']) {
    if (!new RegExp(`<${tag}(?:\\s|>)`).test(html)) throw new Error(`Missing exercised feature: ${tag}`)
  }
  if (!html.includes('class="raw"') || !html.includes('doc-noteref')) throw new Error('Raw block and footnote required')
}
