import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '../styles/theme'
import { Toast as ToastData, ToastVariant } from '../hooks/useToast'

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: number) => void
}

const variantColors: Record<ToastVariant, string> = {
  success: theme.colors.stateOnline,
  error: '#e53e3e',
  info: theme.colors.accent,
}

const variantIcons: Record<ToastVariant, string> = {
  success: '\u2713',
  error: '\u2717',
  info: '\u24D8',
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps): React.ReactElement {
  return (
    <div style={{
      position: 'fixed',
      top: 48,
      right: 16,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
    }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={() => onDismiss(toast.id)}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              borderRadius: 10,
              background: 'rgba(26, 29, 46, 0.95)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${variantColors[toast.variant]}40`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 8px ${variantColors[toast.variant]}20`,
              cursor: 'pointer',
              maxWidth: 340,
              minWidth: 200,
            }}
          >
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: variantColors[toast.variant],
              width: 20,
              textAlign: 'center',
              flexShrink: 0,
            }}>
              {variantIcons[toast.variant]}
            </span>
            <span style={{
              fontSize: 13,
              color: theme.colors.textPrimary,
              lineHeight: 1.4,
              fontFamily: 'inherit',
            }}>
              {toast.message}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
