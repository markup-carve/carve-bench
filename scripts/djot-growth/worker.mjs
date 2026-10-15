import {spawn} from 'node:child_process'
import {createInterface} from 'node:readline'

export function launchWorker(command, args) {
  const child = spawn(command, args, {stdio: ['pipe', 'pipe', 'inherit']})
  const pending = []
  let resolveReady, rejectReady
  const ready = new Promise((resolve, reject) => {resolveReady = resolve; rejectReady = reject})
  const fail = error => {rejectReady(error); for (const item of pending.splice(0)) item.reject(error)}
  child.on('error', fail)
  child.on('exit', (code, signal) => fail(new Error(`Worker exited: ${code ?? signal}`)))
  createInterface({input: child.stdout}).on('line', line => {
    try {
      const row = JSON.parse(line)
      if (row.ready) resolveReady(row)
      else pending.shift()?.resolve(row)
    } catch (error) {fail(error); child.kill()}
  })
  return {child, ready, call: request => new Promise((resolve, reject) => {
    if (child.exitCode !== null || child.signalCode !== null) return reject(new Error('Worker has exited'))
    pending.push({resolve, reject})
    child.stdin.write(JSON.stringify(request) + '\n')
  })}
}
