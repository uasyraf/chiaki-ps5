import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  hosts: {
    get: () => Promise<any[]>
    discover: () => Promise<boolean>
    refresh: () => Promise<any[]>
    onUpdated: (callback: (hosts: any[]) => void) => void
    removeUpdatedListener: () => void
  }
  stream: {
    start: (params: { nickname: string; host: string; fullscreen?: boolean; dualsense?: boolean; passcode?: string }) => Promise<boolean>
    onEnded: (callback: (code: number) => void) => void
    removeEndedListener: () => void
  }
  wakeup: (params: { nickname: string; host: string; registKey: string }) => Promise<boolean>
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
    onUpdated: (callback: (hosts: any[]) => void) => {
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
