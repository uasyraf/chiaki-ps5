export const theme = {
  colors: {
    bgPrimary: '#0e1117',
    bgSecondary: '#1a1d2e',
    bgCard: '#1a1f38',
    bgCardHover: '#252a45',
    bgOverlay: 'rgba(14, 17, 23, 0.85)',
    accent: '#0070d1',
    accentGlow: '#0090ff',
    accentHover: '#0080e0',
    textPrimary: '#ffffff',
    textSecondary: '#8e95a9',
    textMuted: '#4a5278',
    stateOnline: '#00d26a',
    stateStandby: '#ff9f1a',
    stateOffline: '#4a5068',
  },
  radius: { default: 16, small: 8 },
  animation: { fast: 0.15, normal: 0.3, slow: 0.5 },
  card: { width: 280, height: 360 },
  layout: { controlBarHeight: 64, statusBarHeight: 40 },
} as const

export function stateColor(state: string): string {
  switch (state) {
    case 'online': return theme.colors.stateOnline
    case 'standby': return theme.colors.stateStandby
    default: return theme.colors.stateOffline
  }
}

export function stateLabel(state: string): string {
  switch (state) {
    case 'online': return 'Online'
    case 'standby': return 'Standby'
    default: return 'Offline'
  }
}
