import { ipcMain, BrowserWindow } from 'electron'
import { loadHosts, HostInfo } from './chiaki-config'
import { DiscoveryService } from './discovery'
import { ProcessManager } from './process-manager'

let hosts: HostInfo[] = []
const discovery = new DiscoveryService()
const processManager = new ProcessManager()

export function registerIpcHandlers(getWindow: () => BrowserWindow | null): void {
  hosts = loadHosts()

  // Start discovery
  discovery.start(hosts, (updatedHosts) => {
    hosts = updatedHosts
    getWindow()?.webContents.send('hosts:updated', hosts)
  })

  ipcMain.handle('hosts:get', () => hosts)

  ipcMain.handle('hosts:discover', () => {
    discovery.discover()
    return true
  })

  ipcMain.handle('hosts:refresh', () => {
    hosts = loadHosts()
    discovery.updateHosts(hosts)
    return hosts
  })

  ipcMain.handle('stream:start', (_, { nickname, host, fullscreen, dualsense, passcode }: {
    nickname: string
    host: string
    fullscreen?: boolean
    dualsense?: boolean
    passcode?: string
  }) => {
    const win = getWindow()
    processManager.startStream(nickname, host, { fullscreen, dualsense, passcode }, (code) => {
      win?.show()
      win?.webContents.send('stream:ended', code)
    })
    win?.hide()
    return true
  })

  ipcMain.handle('wakeup', (_, { host, registKey }: { host: string; registKey: string }) => {
    processManager.wakeUp(host, registKey)
    return true
  })

  ipcMain.handle('settings:get', () => {
    // Settings are stored in renderer localStorage, this is a passthrough
    return {}
  })

  ipcMain.handle('app:quit', () => {
    discovery.stop()
    processManager.stopStream()
    const win = getWindow()
    win?.close()
  })

  ipcMain.handle('window:minimize', () => {
    getWindow()?.minimize()
  })

  ipcMain.handle('window:close', () => {
    getWindow()?.close()
  })
}
