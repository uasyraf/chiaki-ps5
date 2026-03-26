export interface IpcResult {
  success: boolean
  error?: string
  message?: string
  data?: unknown
}

export interface PsnTokens {
  accountId: string
  authToken: string
  refreshToken: string
  authTokenExpiry: string
}

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
