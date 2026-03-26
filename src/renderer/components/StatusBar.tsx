import React, { useState, useEffect } from 'react'
import { theme } from '../styles/theme'

interface StatusBarProps {
  hostCount: number
  onlineCount: number
}

export function StatusBar({ hostCount, onlineCount }: StatusBarProps): React.ReactElement {
  const [time, setTime] = useState(formatTime())

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px 0 16px',
      background: 'rgba(26, 29, 46, 0.6)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      zIndex: 50,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>
          {hostCount} console{hostCount !== 1 ? 's' : ''}
        </span>
        <span style={{
          fontSize: 13,
          color: onlineCount > 0 ? theme.colors.stateOnline : theme.colors.textMuted,
          fontWeight: onlineCount > 0 ? 500 : 400,
        }}>
          {onlineCount} online
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 13, color: theme.colors.textSecondary, fontVariantNumeric: 'tabular-nums' }}>
          {time}
        </span>
        <div style={{ display: 'flex', gap: 8, WebkitAppRegion: 'no-drag' as any }}>
          <button
            onClick={() => window.electronAPI.app.minimize()}
            style={windowBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            &#x2013;
          </button>
          <button
            onClick={() => window.electronAPI.app.close()}
            style={windowBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,70,70,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            &#x2715;
          </button>
        </div>
      </div>
    </div>
  )
}

const windowBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  border: 'none',
  background: 'transparent',
  color: '#8e95a9',
  fontSize: 14,
  borderRadius: 6,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'inherit',
}

function formatTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
