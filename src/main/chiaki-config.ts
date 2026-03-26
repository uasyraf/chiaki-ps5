import fs from 'fs'
import path from 'path'
import ini from 'ini'
import { HostInfo, IpcResult, PsnTokens } from './types'

export type { HostInfo }

const PS5_TARGET = 1000100
export const CONFIG_PATH = path.join(process.env.HOME || '', '.config/Chiaki/Chiaki.conf')

function stripByteArray(value: string): string {
  const match = value.match(/^@ByteArray\((.+?)\)$/)
  if (!match) return value
  return match[1].replace(/\\0/g, '').replace(/\0/g, '')
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
      hasRpKey: !!(entry.rp_key && stripByteArray(entry.rp_key) !== ''),
      consolePin: entry.console_pin || '',
      registKey: stripByteArray(entry.rp_regist_key || ''),
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

function isValidHostAddress(address: string): boolean {
  // IPv4
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(address)) return true
  // Hostname (basic check)
  if (/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/.test(address)) return true
  return false
}

export function addManualHost(nickname: string, host: string): IpcResult {
  if (!nickname.trim()) return { success: false, error: 'Nickname is required' }
  if (!host.trim()) return { success: false, error: 'Host address is required' }
  if (!isValidHostAddress(host.trim())) return { success: false, error: 'Invalid IP address or hostname' }

  try {
    const configDir = path.dirname(CONFIG_PATH)
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }

    const raw = fs.existsSync(CONFIG_PATH) ? fs.readFileSync(CONFIG_PATH, 'utf-8') : ''
    const config = ini.parse(raw)

    const manSection = config.manual_hosts || {}
    const existing = parseNumberedEntries(manSection)
    const nextIdx = Object.keys(existing).length > 0
      ? Math.max(...Object.keys(existing).map(Number)) + 1
      : 1

    // Check for duplicate host address
    for (const entry of Object.values(existing)) {
      if (entry.host === host.trim()) {
        return { success: false, error: `Host ${host} already exists` }
      }
    }

    if (!config.manual_hosts) config.manual_hosts = {}
    config.manual_hosts[`${nextIdx}\\host`] = host.trim()
    config.manual_hosts[`${nextIdx}\\registered`] = 'false'
    config.manual_hosts[`${nextIdx}\\registered_mac`] = ''
    config.manual_hosts.size = String(nextIdx)

    fs.writeFileSync(CONFIG_PATH, ini.stringify(config))
    return { success: true }
  } catch (err) {
    return { success: false, error: `Failed to write config: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export function removeHost(id: string): IpcResult {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return { success: false, error: 'Config file not found' }

    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
    const config = ini.parse(raw)

    const manSection = config.manual_hosts || {}
    const existing = parseNumberedEntries(manSection)

    let found = false
    const newManual: Record<string, string> = {}
    let newIdx = 1

    for (const entry of Object.values(existing)) {
      const hostAddr = entry.host || ''
      const regMac = entry.registered_mac || ''
      const entryId = `${hostAddr}-${regMac}`

      if (entryId === id) {
        found = true
        continue
      }

      for (const [field, value] of Object.entries(entry)) {
        newManual[`${newIdx}\\${field}`] = value
      }
      newIdx++
    }

    if (!found) return { success: false, error: 'Host not found' }

    newManual.size = String(newIdx - 1)
    config.manual_hosts = newManual

    fs.writeFileSync(CONFIG_PATH, ini.stringify(config))
    return { success: true }
  } catch (err) {
    return { success: false, error: `Failed to update config: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export function readPsnTokens(): PsnTokens | null {
  if (!fs.existsSync(CONFIG_PATH)) return null

  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
  const config = ini.parse(raw)
  const settings = config.settings || {}

  const accountId = settings.psn_account_id || ''
  const authToken = settings.psn_auth_token || ''
  const refreshToken = settings.psn_refresh_token || ''
  const authTokenExpiry = settings.psn_auth_token_expiry || ''

  if (!accountId && !authToken) return null

  return { accountId, authToken, refreshToken, authTokenExpiry }
}

export function writePsnTokens(tokens: PsnTokens): void {
  const configDir = path.dirname(CONFIG_PATH)
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }

  const raw = fs.existsSync(CONFIG_PATH) ? fs.readFileSync(CONFIG_PATH, 'utf-8') : ''
  const config = ini.parse(raw)

  if (!config.settings) config.settings = {}
  config.settings.psn_account_id = tokens.accountId
  config.settings.psn_auth_token = tokens.authToken
  config.settings.psn_refresh_token = tokens.refreshToken
  config.settings.psn_auth_token_expiry = tokens.authTokenExpiry

  fs.writeFileSync(CONFIG_PATH, ini.stringify(config))
}

export function clearPsnTokens(): void {
  if (!fs.existsSync(CONFIG_PATH)) return

  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
  const config = ini.parse(raw)

  if (config.settings) {
    delete config.settings.psn_account_id
    delete config.settings.psn_auth_token
    delete config.settings.psn_refresh_token
    delete config.settings.psn_auth_token_expiry
  }

  fs.writeFileSync(CONFIG_PATH, ini.stringify(config))
}
