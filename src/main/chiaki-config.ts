import fs from 'fs'
import path from 'path'
import ini from 'ini'

const PS5_TARGET = 1000100
const CONFIG_PATH = path.join(process.env.HOME || '', '.config/Chiaki/Chiaki.conf')

export interface HostInfo {
  id: string
  nickname: string
  hostAddress: string
  target: number
  isPS5: boolean
  isRegistered: boolean
  state: 'online' | 'standby' | 'offline'
  consoleName: string
  consolePin: string
  registKey: string
  serverMac: string
}

function parseNumberedEntries(section: Record<string, string>): Record<number, Record<string, string>> {
  const entries: Record<number, Record<string, string>> = {}
  for (const [key, value] of Object.entries(section)) {
    const match = key.match(/^(\d+)\\(.+)$/)
    if (match) {
      const idx = parseInt(match[1])
      const field = match[2]
      if (!entries[idx]) entries[idx] = {}
      entries[idx][field] = String(value)
    }
  }
  return entries
}

export function loadHosts(): HostInfo[] {
  if (!fs.existsSync(CONFIG_PATH)) return []

  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
  const config = ini.parse(raw)

  const regSection = config.registered_hosts || {}
  const manSection = config.manual_hosts || {}

  const registered = parseNumberedEntries(regSection)
  const manual = parseNumberedEntries(manSection)

  // Build MAC -> registered info map
  const regByMac: Record<string, {
    nickname: string
    target: number
    hasRpKey: boolean
    consolePin: string
    registKey: string
    mac: string
  }> = {}

  for (const entry of Object.values(registered)) {
    const mac = entry.server_mac || ''
    regByMac[mac] = {
      nickname: entry.server_nickname || '',
      target: parseInt(entry.target || '0'),
      hasRpKey: !!(entry.rp_key && entry.rp_key !== ''),
      consolePin: entry.console_pin || '',
      registKey: entry.rp_regist_key || '',
      mac
    }
  }

  const hosts: HostInfo[] = []
  for (const [, entry] of Object.entries(manual)) {
    const hostAddr = entry.host || ''
    const isRegistered = entry.registered === 'true'
    const regMac = entry.registered_mac || ''

    const reg = isRegistered ? regByMac[regMac] : undefined

    hosts.push({
      id: `${hostAddr}-${regMac}`,
      nickname: reg?.nickname || hostAddr,
      hostAddress: hostAddr,
      target: reg?.target || 0,
      isPS5: reg ? reg.target === PS5_TARGET : false,
      isRegistered: reg?.hasRpKey || false,
      state: 'offline',
      consoleName: reg?.nickname || '',
      consolePin: reg?.consolePin || '',
      registKey: reg?.registKey || '',
      serverMac: regMac
    })
  }

  return hosts
}
