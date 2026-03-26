import { contextBridge, ipcRenderer } from 'electron'

interface IpcResult {
  success: boolean
  error?: string
}

interface HostInfo {
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

export interface ElectronAPI {
  hosts: {
    get: () => Promise<HostInfo[]>
    discover: () => Promise<IpcResult>
    refresh: () => Promise<{ hosts: HostInfo[]; result: IpcResult }>
    add: (params: { nickname: string; host: string }) => Promise<IpcResult>
    remove: (params: { id: string }) => Promise<IpcResult>
    onUpdated: (callback: (hosts: HostInfo[]) => void) => void
    removeUpdatedListener: () => void
  }
  stream: {
    start: (params: { nickname: string; host: string; fullscreen?: boolean; dualsense?: boolean; passcode?: string }) => Promise<IpcResult>
    onEnded: (callback: (code: number) => void) => void
    removeEndedListener: () => void
  }
  wakeup: (params: { nickname: string; host: string; registKey: string }) => Promise<IpcResult>
  app: {
    quit: () => Promise<void>
    minimize: () => Promise<void>
    close: () => Promise<void>
  }
}

contextBridge.exposeInMainWorld('electronAPI', {
  hosts: {
    get: () => ipcRenderer.invoke('hosts:get'),
    discover: () => ipcRenderer.invoke('hosts:discover'),
    refresh: () => ipcRenderer.invoke('hosts:refresh'),
    add: (params: { nickname: string; host: string }) => ipcRenderer.invoke('hosts:add', params),
    remove: (params: { id: string }) => ipcRenderer.invoke('hosts:remove', params),
    onUpdated: (callback: (hosts: HostInfo[]) => void) => {
      ipcRenderer.on('hosts:updated', (_, hosts) => callback(hosts))
    },
    removeUpdatedListener: () => {
      ipcRenderer.removeAllListeners('hosts:updated')
    }
  },
  stream: {
    start: (params) => ipcRenderer.invoke('stream:start', params),
    onEnded: (callback: (code: number) => void) => {
      ipcRenderer.on('stream:ended', (_, code) => callback(code))
    },
    removeEndedListener: () => {
      ipcRenderer.removeAllListeners('stream:ended')
    }
  },
  wakeup: (params) => ipcRenderer.invoke('wakeup', params),
  app: {
    quit: () => ipcRenderer.invoke('app:quit'),
    minimize: () => ipcRenderer.invoke('window:minimize'),
    close: () => ipcRenderer.invoke('window:close')
  }
} satisfies ElectronAPI)
