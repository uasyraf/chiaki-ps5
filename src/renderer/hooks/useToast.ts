import { useState, useCallback, useRef } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface UseToastResult {
  toasts: Toast[]
  showToast: (message: string, variant: ToastVariant) => void
  dismissToast: (id: number) => void
}

const MAX_TOASTS = 3
const AUTO_DISMISS_MS = 4000

export function useToast(): UseToastResult {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, variant: ToastVariant) => {
    const id = nextId.current++
    setToasts(prev => {
      const next = [...prev, { id, message, variant }]
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next
    })

    setTimeout(() => {
      dismissToast(id)
    }, AUTO_DISMISS_MS)
  }, [dismissToast])

  return { toasts, showToast, dismissToast }
}
