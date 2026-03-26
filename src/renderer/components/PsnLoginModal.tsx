import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '../styles/theme'

interface PsnTokens {
  accountId: string
  authToken: string
  refreshToken: string
  authTokenExpiry: string
}

interface PsnLoginModalProps {
  open: boolean
  onClose: () => void
  onHostsChanged: () => void
}

type Step = 'login' | 'register' | 'done'

export function PsnLoginModal({ open, onClose, onHostsChanged }: PsnLoginModalProps): React.ReactElement {
  const [step, setStep] = useState<Step>('login')
  const [tokens, setTokens] = useState<PsnTokens | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resultMessage, setResultMessage] = useState('')

  useEffect(() => {
    if (open) {
      setStep('login')
      setError('')
      setResultMessage('')
      loadTokens()
    }
  }, [open])

  const loadTokens = async () => {
    const t = await window.electronAPI.psn.getTokens()
    setTokens(t)
  }

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const result = await window.electronAPI.psn.login()
    setLoading(false)

    if (result.success && result.data) {
      setTokens(result.data as PsnTokens)
      setStep('register')
    } else {
      if (result.error !== 'Login cancelled') {
        setError(result.error || 'Login failed')
      }
    }
  }

  const handleLogout = async () => {
    await window.electronAPI.psn.logout()
    setTokens(null)
  }

  const handleLaunchRegistration = async () => {
    setLoading(true)
    setError('')
    const result = await window.electronAPI.registration.launch()
    setLoading(false)

    if (result.success) {
      setResultMessage(result.message || 'Registration complete')
      onHostsChanged()
      setStep('done')
    } else {
      setError(result.error || 'Registration failed')
    }
  }

  const handleClose = () => {
    setStep('login')
    setError('')
    setLoading(false)
    onClose()
  }

  const isLoggedIn = tokens && tokens.accountId

  const inputStyle: React.CSSProperties = {
    padding: '9px 20px',
    borderRadius: 8,
    border: 'none',
    background: theme.colors.accent,
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
  }

  const outlineStyle: React.CSSProperties = {
    ...inputStyle,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    color: theme.colors.textSecondary,
    fontWeight: 500,
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
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
              width: 420,
              padding: 28,
              borderRadius: 16,
              background: theme.colors.bgSecondary,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Step indicators */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {(['login', 'register', 'done'] as Step[]).map((s, i) => (
                <div key={s} style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: i <= ['login', 'register', 'done'].indexOf(step)
                    ? theme.colors.accent
                    : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>

            {step === 'login' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.colors.textPrimary, margin: 0 }}>
                  PSN Account
                </h2>
                <p style={{ fontSize: 13, color: theme.colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
                  Sign in with your PlayStation Network account to register consoles.
                </p>

                {isLoggedIn ? (
                  <div style={{
                    padding: 14,
                    borderRadius: 10,
                    background: 'rgba(0, 210, 106, 0.08)',
                    border: '1px solid rgba(0, 210, 106, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <span style={{ fontSize: 18, color: theme.colors.stateOnline }}>{'\u2713'}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: theme.colors.textPrimary }}>Signed In</div>
                      <div style={{ fontSize: 11, color: theme.colors.textSecondary }}>
                        Account: {tokens!.accountId.slice(0, 16)}...
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: 14,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>Not signed in</div>
                  </div>
                )}

                {error && (
                  <div style={{ fontSize: 12, color: '#e53e3e', padding: '4px 0' }}>{error}</div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {isLoggedIn ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep('register')}
                        style={inputStyle}
                      >
                        Continue to Registration
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        style={outlineStyle}
                      >
                        Sign Out
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogin}
                      disabled={loading}
                      style={{
                        ...inputStyle,
                        background: loading ? theme.colors.textMuted : '#003087',
                        cursor: loading ? 'wait' : 'pointer',
                      }}
                    >
                      {loading ? 'Opening login...' : 'Sign in with PlayStation'}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    style={outlineStyle}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            )}

            {step === 'register' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.colors.textPrimary, margin: 0 }}>
                  Register Console
                </h2>
                <div style={{
                  padding: 16,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <p style={{ fontSize: 13, color: theme.colors.textSecondary, margin: '0 0 12px 0', lineHeight: 1.6 }}>
                    Before registering, put your PS5 in link mode:
                  </p>
                  <ol style={{ fontSize: 13, color: theme.colors.textPrimary, margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                    <li>Go to <strong>Settings</strong> on your PS5</li>
                    <li>Navigate to <strong>System &gt; Remote Play</strong></li>
                    <li>Select <strong>Link Device</strong></li>
                  </ol>
                </div>

                <p style={{ fontSize: 12, color: theme.colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
                  This will open Chiaki to complete the registration handshake. Close Chiaki when done.
                </p>

                {error && (
                  <div style={{ fontSize: 12, color: '#e53e3e', padding: '4px 0' }}>{error}</div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLaunchRegistration}
                  disabled={loading}
                  style={{
                    ...inputStyle,
                    background: loading ? theme.colors.textMuted : theme.colors.accent,
                    cursor: loading ? 'wait' : 'pointer',
                  }}
                >
                  {loading ? 'Waiting for Chiaki...' : 'Open Chiaki Registration'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('login')}
                  disabled={loading}
                  style={outlineStyle}
                >
                  Back
                </motion.button>
              </div>
            )}

            {step === 'done' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 4 }}>
                  {resultMessage.includes('0 new') || resultMessage.includes('No new') ? '\u2139' : '\u2713'}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.colors.textPrimary, margin: 0 }}>
                  {resultMessage.includes('0 new') || resultMessage.includes('No new') ? 'No New Consoles' : 'Registration Complete'}
                </h2>
                <p style={{ fontSize: 13, color: theme.colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
                  {resultMessage}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    style={inputStyle}
                  >
                    Done
                  </motion.button>
                  {(resultMessage.includes('0 new') || resultMessage.includes('No new')) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setStep('register'); setError(''); }}
                      style={outlineStyle}
                    >
                      Try Again
                    </motion.button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
