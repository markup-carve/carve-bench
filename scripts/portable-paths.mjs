// Reports under reports/ are committed and published, so a generator records
// which interpreter and which tree, never where they live on the machine that
// measured. A path inside this repo stays relative to its root; anything else
// is reduced to its file name.
import { basename, relative, resolve, isAbsolute } from 'node:path'

export function portablePath(path, root) {
  const inside = relative(root, resolve(path))
  return inside && !inside.startsWith('..') && !isAbsolute(inside) ? inside : basename(resolve(path))
}

export const portableArgs = (args, root) => args.map(arg => (isAbsolute(arg) ? portablePath(arg, root) : arg))

export const portableValues = (record, root) =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [key, portablePath(value, root)]))
