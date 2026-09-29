import { mkdirSync, cpSync, rmSync } from 'node:fs'
export default function setup() {
  const preview = new URL('../_preview/', import.meta.url)
  rmSync(preview, { recursive: true, force: true })
  mkdirSync(preview, { recursive: true })
  cpSync(new URL('../_site/', import.meta.url), new URL('carve-bench/', preview), { recursive: true })
}
