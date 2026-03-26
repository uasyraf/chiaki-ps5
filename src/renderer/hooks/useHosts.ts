import { useState, useEffect, useCallback } from 'react'

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

interface UseHostsResult {
  hosts: HostInfo[]
  selectedIndex: number
  setSelectedIndex: (i: number) => void
  connect: (host: HostInfo) => void
  wake: (host: HostInfo) => void
  discover: () => void
  refresh: () => void
}

export function useHosts(): UseHostsResult {
  const [hosts, setHosts] = useState<HostInfo[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    window.electronAPI.hosts.get().then(setHosts)

    window.electronAPI.hosts.onUpdated((updated: HostInfo[]) => {
      setHosts(updated)
    })

    window.electronAPI.stream.onEnded(() => {
      // Window re-shown by main process
    })

    return () => {
      window.electronAPI.hosts.removeUpdatedListener()
      window.electronAPI.stream.removeEndedListener()
    }
  }, [])

  const connect = useCallback((host: HostInfo) => {
    const settings = JSON.parse(localStorage.getItem('chiaki-settings') || '{}')
    window.electronAPI.stream.start({
      nickname: host.nickname,
      host: host.hostAddress,
      fullscreen: settings.fullscreen ?? true,
      dualsense: settings.dualsense ?? true,
      passcode: host.consolePin || undefined,
    })
  }, [])

  const wake = useCallback((host: HostInfo) => {
    window.electronAPI.wakeup({
      host: host.hostAddress,
      registKey: host.registKey,
    })
  }, [])

  const discover = useCallback(() => {
    window.electronAPI.hosts.discover()
  }, [])

  const refresh = useCallback(async () => {
    const updated = await window.electronAPI.hosts.refresh()
    setHosts(updated)
  }, [])

  return { hosts, selectedIndex, setSelectedIndex, connect, wake, discover, refresh }
}
