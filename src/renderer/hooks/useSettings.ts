import { useState, useCallback } from 'react'

export interface Settings {
  fullscreen: boolean
  dualsense: boolean
  resolution: string
}

const STORAGE_KEY = 'chiaki-settings'

const defaults: Settings = {
  fullscreen: true,
  dualsense: true,
  resolution: '1080p',
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaults, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...defaults }
}

export function useSettings(): [Settings, (updates: Partial<Settings>) => void] {
  const [settings, setSettings] = useState<Settings>(load)

  const update = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return [settings, update]
}
