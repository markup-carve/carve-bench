import { readFileSync } from 'node:fs'

export function cpuAffinity() {
  if (process.platform !== 'linux') return null
  const mask = readFileSync('/proc/self/status', 'utf8').match(/^Cpus_allowed_list:\s*(.+)$/m)?.[1]
  if (!mask) return null
  return mask.trim().split(',').flatMap(part => {
    const [first, last = first] = part.split('-').map(Number)
    return Array.from({ length: last - first + 1 }, (_, index) => first + index)
  })
}

export function affinityDescription(affinity) {
  return affinity ? `Allowed CPUs: ${affinity.join(', ')}. Child processes inherit this affinity, including Node compiler and GC threads.` : 'CPU affinity was unavailable on this platform.'
}
