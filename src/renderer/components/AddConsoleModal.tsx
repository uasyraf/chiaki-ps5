import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '../styles/theme'

interface AddConsoleModalProps {
  open: boolean
  onClose: () => void
  onAdd: (nickname: string, host: string) => Promise<{ success: boolean; error?: string }>
}

export function AddConsoleModal({ open, onClose, onAdd }: AddConsoleModalProps): React.ReactElement {
  const [nickname, setNickname] = useState('')
  const [host, setHost] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nickname.trim()) { setError('Nickname is required'); return }
    if (!host.trim()) { setError('Host address is required'); return }

    setLoading(true)
    const result = await onAdd(nickname.trim(), host.trim())
    setLoading(false)

    if (result.success) {
      setNickname('')
      setHost('')
      onClose()
    } else {
      setError(result.error || 'Failed to add console')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 500,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            style={{
              width: 380,
              padding: 28,
              borderRadius: 16,
              background: theme.colors.bgSecondary,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: theme.colors.textPrimary }}>
              Add Console
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 6, display: 'block' }}>
                  Nickname
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="My PS5"
                  style={inputStyle}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 6, display: 'block' }}>
                  Host Address
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={e => setHost(e.target.value)}
                  placeholder="192.168.1.100"
                  style={inputStyle}
                />
              </div>
              {error && (
                <div style={{ fontSize: 12, color: '#e53e3e', padding: '4px 0' }}>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 6, justifyContent: 'flex-end' }}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    color: theme.colors.textSecondary,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: loading ? theme.colors.textMuted : theme.colors.accent,
                    color: theme.colors.textPrimary,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: loading ? 'wait' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {loading ? 'Adding...' : 'Add Console'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
