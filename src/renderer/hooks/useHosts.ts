import { useState, useEffect, useCallback } from 'react'
import { ToastVariant } from './useToast'

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

interface IpcResult {
  success: boolean
  error?: string
}

interface UseHostsResult {
  hosts: HostInfo[]
  selectedIndex: number
  setSelectedIndex: (i: number) => void
  connect: (host: HostInfo) => void
  wake: (host: HostInfo) => void
  discover: () => void
  refresh: () => void
  addHost: (nickname: string, host: string) => Promise<IpcResult>
  removeHost: (id: string) => Promise<IpcResult>
}

export function useHosts(showToast: (message: string, variant: ToastVariant) => void): UseHostsResult {
  const [hosts, setHosts] = useState<HostInfo[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    window.electronAPI.hosts.get().then(setHosts)

    window.electronAPI.hosts.onUpdated((updated: HostInfo[]) => {
      setHosts(updated)
    })

    window.electronAPI.stream.onEnded((code: number) => {
      if (code !== 0) {
        showToast(`Stream ended with error (code ${code})`, 'error')
      }
    })

    return () => {
      window.electronAPI.hosts.removeUpdatedListener()
      window.electronAPI.stream.removeEndedListener()
    }
  }, [showToast])

  const connect = useCallback((host: HostInfo) => {
    const settings = JSON.parse(localStorage.getItem('chiaki-settings') || '{}')
    window.electronAPI.stream.start({
      nickname: host.nickname,
      host: host.hostAddress,
      fullscreen: settings.fullscreen ?? true,
      dualsense: settings.dualsense ?? true,
      passcode: host.consolePin || undefined,
    }).then((result: IpcResult) => {
      if (!result.success) {
        showToast(result.error || 'Failed to start stream', 'error')
      }
    })
  }, [showToast])

  const wake = useCallback((host: HostInfo) => {
    window.electronAPI.wakeup({
      nickname: host.nickname,
      host: host.hostAddress,
      registKey: host.registKey,
    }).then((result: IpcResult) => {
      if (result.success) {
        showToast(`Wake signal sent to ${host.nickname}`, 'success')
      } else {
        showToast(result.error || 'Wake failed', 'error')
      }
    })
  }, [showToast])

  const discover = useCallback(() => {
    showToast('Scanning network...', 'info')
    window.electronAPI.hosts.discover().then((result: IpcResult) => {
      if (!result.success) {
        showToast(result.error || 'Discovery failed', 'error')
      }
    })
  }, [showToast])

  const refresh = useCallback(async () => {
    const { hosts: updated, result } = await window.electronAPI.hosts.refresh()
    if (result.success) {
      setHosts(updated)
    } else {
      showToast(result.error || 'Failed to refresh', 'error')
    }
  }, [showToast])

  const addHost = useCallback(async (nickname: string, host: string): Promise<IpcResult> => {
    const result = await window.electronAPI.hosts.add({ nickname, host })
    if (result.success) {
      showToast(`Added ${nickname}`, 'success')
    } else {
      showToast(result.error || 'Failed to add console', 'error')
    }
    return result
  }, [showToast])

  const removeHost = useCallback(async (id: string): Promise<IpcResult> => {
    const result = await window.electronAPI.hosts.remove({ id })
    if (result.success) {
      showToast('Console removed', 'success')
    } else {
      showToast(result.error || 'Failed to remove console', 'error')
    }
    return result
  }, [showToast])

  return { hosts, selectedIndex, setSelectedIndex, connect, wake, discover, refresh, addHost, removeHost }
}
