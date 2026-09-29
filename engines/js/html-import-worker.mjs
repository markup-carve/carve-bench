import { createInterface } from 'node:readline'
import { pathToFileURL } from 'node:url'

const { htmlToAst, renderMarkdown } = await import(pathToFileURL(process.argv[2]).href)
for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
  let request
  try {
    request = JSON.parse(line)
    const markdown = renderMarkdown(htmlToAst(request.html, { mode: request.mode ?? 'safe' }).value)
    process.stdout.write(JSON.stringify({ id: request.id, ok: true, markdown }) + '\n')
  } catch (error) {
    process.stdout.write(JSON.stringify({ id: request?.id, ok: false, error: String(error) }) + '\n')
  }
}
