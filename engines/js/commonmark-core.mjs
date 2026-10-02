import { parseFragment } from 'parse5'

export function coreSources(sectionCount = 150) {
  const result = {}
  for (const flavor of ['carve', 'djot', 'markdown']) {
    const strong = flavor === 'markdown' ? '**strong**' : '*strong*'
    const emphasis = flavor === 'carve' ? '/emphasis/' : flavor === 'djot' ? '_emphasis_' : '*emphasis*'
    let source = '# Shared JavaScript core benchmark\n\n[site]: https://example.com\n\n'
    for (let i = 1; i <= sectionCount; i++) source += `## Section ${i}

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

---

`
    result[flavor] = source.trimEnd() + '\n'
  }
  return result
}

// Section wrappers, generated IDs and list paragraph wrappers are not shared APIs.
export function coreProjection(html) {
  const walk = (node, parent = '', verbatim = false) => {
    if (node.nodeName === '#text') {
      const text = verbatim ? node.value : node.value.replace(/\s+/g, ' ')
      return text ? [{ text }] : []
    }
    const children = (node.childNodes ?? []).flatMap(child => walk(child, node.tagName ?? node.nodeName, verbatim || node.tagName === 'pre' || node.tagName === 'code'))
    if (!verbatim && ['#document-fragment', 'section', 'ul', 'li', 'p', 'h1', 'h2', 'blockquote'].includes(node.tagName ?? node.nodeName)) {
      const block = item => item?.tag && !['a', 'em', 'strong', 'code'].includes(item.tag)
      children.forEach((child, index) => {
        if (child.text === undefined) return
        if (index === 0 || block(children[index - 1])) child.text = child.text.trimStart()
        if (index === children.length - 1 || block(children[index + 1])) child.text = child.text.trimEnd()
      })
    }
    const normalized = children.filter(child => child.text !== '')
    if (!node.tagName || node.tagName === 'section' || (node.tagName === 'p' && parent === 'li')) return normalized
    const attributes = Object.fromEntries((node.attrs ?? []).filter(attr => attr.name === 'href' || (node.tagName === 'code' && attr.name === 'class')).map(attr => [attr.name, attr.value]))
    return [{ tag: node.tagName, attributes, children: normalized }]
  }
  return walk(parseFragment(html))
}
