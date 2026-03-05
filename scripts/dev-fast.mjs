#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import net from 'node:net'

const projectRoot = process.cwd()
const devLockPath = path.join(projectRoot, '.next', 'dev', 'lock')
const devNodeModulesPath = path.join(projectRoot, '.next', 'dev', 'node_modules')
const nextBin = path.join(projectRoot, 'node_modules', '.bin', 'next')

const START_TIMEOUT_MS = Number(process.env.DEV_START_TIMEOUT_MS || 120000)
const PORT = Number(process.env.PORT || 3000)

function log(message) {
  process.stdout.write(`[dev-fast] ${message}\n`)
}

function cleanupStaleLock() {
  if (!fs.existsSync(devLockPath)) return

  const lockHolders = spawnSync('lsof', ['-t', devLockPath], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })

  const holders = lockHolders.status === 0
    ? lockHolders.stdout.split(/\s+/).filter(Boolean)
    : []

  if (holders.length === 0) {
    try {
      fs.unlinkSync(devLockPath)
      log('removed stale .next/dev/lock')
    } catch {}
  }
}

function cleanupStaleDevNodeModules() {
  if (!fs.existsSync(devNodeModulesPath)) return
  try {
    fs.rmSync(devNodeModulesPath, { recursive: true, force: true })
    log('removed stale .next/dev/node_modules cache')
  } catch {}
}

function cleanupOrphanNextProcesses() {
  const ps = spawnSync('ps', ['-Ao', 'pid=,command='], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })

  if (ps.status !== 0) return

  const candidates = ps.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const firstSpace = line.indexOf(' ')
      if (firstSpace === -1) return null
      const pid = Number(line.slice(0, firstSpace))
      const cmd = line.slice(firstSpace + 1)
      return Number.isFinite(pid) ? { pid, cmd } : null
    })
    .filter(Boolean)
    .filter(({ pid, cmd }) => {
      if (pid === process.pid) return false
      if (!cmd.includes(projectRoot)) return false
      return (
        cmd.includes('next dev') ||
        cmd.includes('start-server.js') ||
        cmd.includes('next-server (v')
      )
    })

  if (candidates.length === 0) return

  for (const { pid } of candidates) {
    try {
      process.kill(pid, 'SIGKILL')
    } catch {}
  }

  log(`killed ${candidates.length} orphan next process(es)`) 
}

function waitForPort(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs

  return new Promise((resolve) => {
    const tryConnect = () => {
      if (Date.now() > deadline) {
        resolve(false)
        return
      }

      const socket = net.createConnection({ host: '127.0.0.1', port })

      socket.once('connect', () => {
        socket.destroy()
        resolve(true)
      })

      socket.once('error', () => {
        socket.destroy()
        setTimeout(tryConnect, 500)
      })
    }

    tryConnect()
  })
}

async function stopChild(child, exited) {
  if (child.exitCode != null) return

  try {
    child.kill('SIGTERM')
  } catch {}

  await Promise.race([
    exited,
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ])

  if (child.exitCode == null) {
    try {
      child.kill('SIGKILL')
    } catch {}
    await exited
  }
}

async function runMode(label, modeArgs) {
  log(`starting Next in ${label} mode`) 

  const child = spawn(nextBin, ['dev', '--port', String(PORT), ...modeArgs], {
    cwd: projectRoot,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || '1',
    },
    stdio: ['inherit', 'pipe', 'pipe'],
  })

  const onOutput = (chunk, target) => {
    target.write(chunk)
  }

  child.stdout.on('data', (chunk) => onOutput(chunk, process.stdout))
  child.stderr.on('data', (chunk) => onOutput(chunk, process.stderr))

  const exited = new Promise((resolve) => {
    child.on('exit', (code, signal) => resolve({ code, signal }))
  })

  const started = Promise.race([
    waitForPort(PORT, START_TIMEOUT_MS),
    exited.then(() => false),
  ])

  const ok = await started

  if (ok) {
    log(`server is listening on http://localhost:${PORT}`)

    const forwardSignal = (signal) => {
      if (!child.killed) {
        try {
          child.kill(signal)
        } catch {}
      }
    }

    process.on('SIGINT', () => forwardSignal('SIGINT'))
    process.on('SIGTERM', () => forwardSignal('SIGTERM'))

    const { code, signal } = await exited
    process.exit(code ?? (signal ? 1 : 0))
  }

  if (child.exitCode == null) {
    log(`${label} mode did not start within ${START_TIMEOUT_MS}ms, switching mode`)
    await stopChild(child, exited)
  }

  return false
}

async function main() {
  cleanupOrphanNextProcesses()
  cleanupStaleLock()
  cleanupStaleDevNodeModules()

  const modes = [
    { label: 'turbopack', args: ['--turbopack'] },
    { label: 'webpack', args: ['--webpack'] },
  ]

  for (const mode of modes) {
    const ok = await runMode(mode.label, mode.args)
    if (ok) return
  }

  log('failed to start Next.js quickly in both modes')
  process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
