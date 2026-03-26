import { ipcMain, BrowserWindow } from 'electron'
import { loadHosts, addManualHost, removeHost, readPsnTokens, clearPsnTokens } from './chiaki-config'
import { DiscoveryService } from './discovery'
import { ProcessManager } from './process-manager'
import { startPsnOAuth } from './psn-auth'
import { launchChiakiRegistration } from './registration'
import { HostInfo, IpcResult } from './types'

let hosts: HostInfo[] = []
const discovery = new DiscoveryService()
const processManager = new ProcessManager()

export function registerIpcHandlers(getWindow: () => BrowserWindow | null): void {
  hosts = loadHosts()

  discovery.start(hosts, (updatedHosts) => {
    hosts = updatedHosts
    getWindow()?.webContents.send('hosts:updated', hosts)
  })

  ipcMain.handle('hosts:get', () => hosts)

  ipcMain.handle('hosts:discover', async (): Promise<IpcResult> => {
    try {
      const found = await discovery.discoverOnce()
      return { success: true, data: found }
    } catch (err) {
      return { success: false, error: `Discovery failed: ${err instanceof Error ? err.message : String(err)}` }
    }
  })

  ipcMain.handle('hosts:refresh', (): { hosts: HostInfo[]; result: IpcResult } => {
    try {
      hosts = loadHosts()
      discovery.updateHosts(hosts)
      return { hosts, result: { success: true } }
    } catch (err) {
      return { hosts: [], result: { success: false, error: `Failed to load config: ${err instanceof Error ? err.message : String(err)}` } }
    }
  })

  ipcMain.handle('hosts:add', (_, { nickname, host }: { nickname: string; host: string }): IpcResult => {
    const result = addManualHost(nickname, host)
    if (result.success) {
      hosts = loadHosts()
      discovery.updateHosts(hosts)
      getWindow()?.webContents.send('hosts:updated', hosts)
    }
    return result
  })

  ipcMain.handle('hosts:remove', (_, { id }: { id: string }): IpcResult => {
    const result = removeHost(id)
    if (result.success) {
      hosts = loadHosts()
      discovery.updateHosts(hosts)
      getWindow()?.webContents.send('hosts:updated', hosts)
    }
    return result
  })

  ipcMain.handle('stream:start', (_, { nickname, host, fullscreen, dualsense, passcode }: {
    nickname: string
    host: string
    fullscreen?: boolean
    dualsense?: boolean
    passcode?: string
  }): IpcResult => {
    const win = getWindow()
    const result = processManager.startStream(nickname, host, { fullscreen, dualsense, passcode }, (code) => {
      win?.show()
      win?.webContents.send('stream:ended', code)
    })
    if (result.success) {
      win?.hide()
    }
    return result
  })

  ipcMain.handle('wakeup', async (_, { nickname, host, registKey }: { nickname: string; host: string; registKey: string }): Promise<IpcResult> => {
    return processManager.wakeUp(nickname, host, registKey)
  })

  ipcMain.handle('settings:get', () => {
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

  // PSN handlers
  ipcMain.handle('psn:get-tokens', () => {
    return readPsnTokens()
  })

  ipcMain.handle('psn:login', async (): Promise<IpcResult> => {
    const win = getWindow()
    if (!win) return { success: false, error: 'No window available' }
    try {
      const tokens = await startPsnOAuth(win)
      return { success: true, data: tokens }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg === 'Login window closed') return { success: false, error: 'Login cancelled' }
      return { success: false, error: msg }
    }
  })

  ipcMain.handle('psn:logout', (): IpcResult => {
    try {
      clearPsnTokens()
      return { success: true }
    } catch (err) {
      return { success: false, error: `Failed to clear tokens: ${err instanceof Error ? err.message : String(err)}` }
    }
  })

  // Registration handlers
  ipcMain.handle('registration:launch', async (): Promise<IpcResult> => {
    try {
      const { newHosts } = await launchChiakiRegistration()
      hosts = loadHosts()
      discovery.updateHosts(hosts)
      getWindow()?.webContents.send('hosts:updated', hosts)
      return {
        success: true,
        message: newHosts.length > 0
          ? `Registered ${newHosts.length} new console(s)`
          : 'No new consoles registered',
        data: { newHosts, totalHosts: hosts.length },
      }
    } catch (err) {
      return { success: false, error: `Registration failed: ${err instanceof Error ? err.message : String(err)}` }
    }
  })
}
