import React from 'react'
import { motion } from 'framer-motion'
import { theme } from '../styles/theme'

interface EmptyStateProps {
  onDiscover: () => void
  onAddManually: () => void
}

export function EmptyState({ onDiscover, onAddManually }: EmptyStateProps): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div style={{ fontSize: 48, opacity: 0.3, marginBottom: 8 }}>
        🎮
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 600 }}>No Consoles Found</h2>
      <p style={{ fontSize: 14, color: theme.colors.textSecondary, maxWidth: 300, lineHeight: 1.5 }}>
        Make sure your console is on the same network and registered in Chiaki.
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDiscover}
        style={{
          marginTop: 8,
          padding: '12px 32px',
          borderRadius: 24,
          border: 'none',
          background: theme.colors.accent,
          color: theme.colors.textPrimary,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Discover Consoles
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddManually}
        style={{
          padding: '12px 32px',
          borderRadius: 24,
          border: `1px solid ${theme.colors.accent}`,
          background: 'transparent',
          color: theme.colors.accent,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Add Manually
      </motion.button>
    </motion.div>
  )
}
