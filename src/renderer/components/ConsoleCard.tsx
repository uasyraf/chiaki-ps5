import React from 'react'
import { motion } from 'framer-motion'
import { stateColor, stateLabel, theme } from '../styles/theme'

interface HostInfo {
  id: string
  nickname: string
  hostAddress: string
  isPS5: boolean
  isRegistered: boolean
  state: 'online' | 'standby' | 'offline'
}

interface ConsoleCardProps {
  host: HostInfo
  selected: boolean
  onSelect: () => void
  onConnect: () => void
  onWake: () => void
}

export function ConsoleCard({ host, selected, onSelect, onConnect, onWake }: ConsoleCardProps): React.ReactElement {
  const color = stateColor(host.state)
  const label = stateLabel(host.state)

  const handleAction = () => {
    if (host.state === 'online') onConnect()
    else if (host.isRegistered) onWake()
  }

  const actionLabel = host.state === 'online' ? 'Connect' : host.isRegistered ? 'Wake' : 'Offline'
  const actionEnabled = host.state === 'online' || host.isRegistered

  return (
    <motion.div
      className="console-card"
      onClick={onSelect}
      onDoubleClick={handleAction}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        boxShadow: selected
          ? `0 0 30px ${theme.colors.accentGlow}40, 0 0 60px ${theme.colors.accentGlow}20`
          : '0 4px 20px rgba(0,0,0,0.3)'
      }}
      transition={{ duration: theme.animation.normal }}
      style={{
        width: theme.card.width,
        height: theme.card.height,
        background: selected ? theme.colors.bgCardHover : theme.colors.bgCard,
        borderRadius: theme.radius.default,
        border: selected ? `2px solid ${theme.colors.accent}` : '2px solid transparent',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={host.isPS5 ? './ps5-console.svg' : './ps4-console.svg'}
          alt={host.isPS5 ? 'PS5' : 'PS4'}
          style={{ width: 100, height: 100, opacity: 0.9 }}
        />
      </div>

      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
          {host.nickname}
        </div>
        <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginBottom: 12 }}>
          {host.hostAddress}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <span
            className={host.state === 'online' ? 'pulse-dot' : ''}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: color,
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: 13, color, fontWeight: 500 }}>{label}</span>
        </div>

        <motion.button
          whileHover={actionEnabled ? { scale: 1.05 } : {}}
          whileTap={actionEnabled ? { scale: 0.95 } : {}}
          onClick={(e) => { e.stopPropagation(); handleAction() }}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: theme.radius.small,
            border: 'none',
            background: actionEnabled ? theme.colors.accent : theme.colors.stateOffline,
            color: theme.colors.textPrimary,
            fontSize: 14,
            fontWeight: 600,
            cursor: actionEnabled ? 'pointer' : 'default',
            opacity: actionEnabled ? 1 : 0.5,
            fontFamily: 'inherit',
          }}
        >
          {actionLabel}
        </motion.button>
      </div>
    </motion.div>
  )
}
