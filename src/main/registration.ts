import { spawn } from 'child_process'
import { ProcessManager } from './process-manager'
import { loadHosts } from './chiaki-config'
import { HostInfo } from './types'

const processManager = new ProcessManager()

export function launchChiakiRegistration(): Promise<{ newHosts: HostInfo[] }> {
  return new Promise((resolve, reject) => {
    const binary = processManager.findBinary()
    if (!binary) {
      reject(new Error('chiaki/chiaki-ng not found in PATH'))
      return
    }

    const beforeHosts = loadHosts()

    const env = { ...process.env }
    delete env.QT_STYLE_OVERRIDE
    delete env.QT_QPA_PLATFORMTHEME

    const proc = spawn(binary, [], {
      stdio: 'inherit',
      detached: true,
      env,
    })

    proc.unref()

    proc.on('error', (err) => {
      reject(new Error(`Failed to launch ${binary}: ${err.message}`))
    })

    proc.on('close', () => {
      const afterHosts = loadHosts()
      const newHosts = getNewRegistrations(beforeHosts, afterHosts)
      resolve({ newHosts })
    })
  })
}

function getNewRegistrations(before: HostInfo[], after: HostInfo[]): HostInfo[] {
  const beforeIds = new Set(before.map(h => h.id))
  return after.filter(h => !beforeIds.has(h.id))
}
