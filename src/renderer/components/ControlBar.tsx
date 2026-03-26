import React from 'react'
import { motion } from 'framer-motion'
import { theme } from '../styles/theme'

interface ControlBarProps {
  onDiscover: () => void
  onRefresh: () => void
  onAddConsole: () => void
  onPsnRegister: () => void
  onSettings: () => void
  onQuit: () => void
}

export function ControlBar({ onDiscover, onRefresh, onAddConsole, onPsnRegister, onSettings, onQuit }: ControlBarProps): React.ReactElement {
  return (
    <div style={{
      minHeight: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 8,
      padding: '6px 12px',
      background: 'rgba(26, 29, 46, 0.6)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      zIndex: 50,
    }}>
      <ControlButton label="Discover" icon="search" onClick={onDiscover} />
      <ControlButton label="Refresh" icon="refresh" onClick={onRefresh} />
      <ControlButton label="Add Console" icon="plus" onClick={onAddConsole} />
      <ControlButton label="PSN Register" icon="psn" onClick={onPsnRegister} />
      <ControlButton label="Settings" icon="settings" onClick={onSettings} />
      <ControlButton label="Quit" icon="power" onClick={onQuit} accent />
    </div>
  )
}

function ControlButton({ label, icon, onClick, accent }: {
  label: string
  icon: string
  onClick: () => void
  accent?: boolean
}): React.ReactElement {
  const iconMap: Record<string, string> = {
    search: '\u{1F50D}',
    refresh: '\u21BB',
    plus: '+',
    psn: '\u{1F3AE}',
    settings: '\u2699',
    power: '\u23FB',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        border: accent ? `1px solid ${theme.colors.accent}` : '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        background: accent ? `${theme.colors.accent}20` : 'rgba(255,255,255,0.03)',
        color: accent ? theme.colors.accent : theme.colors.textSecondary,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        letterSpacing: '0.02em',
      }}
    >
      <span style={{ fontSize: 16 }}>{iconMap[icon] || ''}</span>
      {label}
    </motion.button>
  )
}
