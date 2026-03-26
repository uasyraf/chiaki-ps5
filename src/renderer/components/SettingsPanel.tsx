import React from 'react'
import { motion } from 'framer-motion'
import { theme } from '../styles/theme'
import { Settings } from '../hooks/useSettings'

interface SettingsPanelProps {
  settings: Settings
  onUpdate: (updates: Partial<Settings>) => void
  onClose: () => void
}

export function SettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps): React.ReactElement {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 200,
        }}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 360,
          background: 'rgba(26, 31, 56, 0.85)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          zIndex: 201,
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Settings</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.textSecondary,
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            &#x2715;
          </button>
        </div>

        <SettingToggle
          label="Fullscreen"
          description="Launch streams in fullscreen mode"
          value={settings.fullscreen}
          onChange={(v) => onUpdate({ fullscreen: v })}
        />

        <SettingToggle
          label="DualSense"
          description="Enable DualSense haptic feedback"
          value={settings.dualsense}
          onChange={(v) => onUpdate({ dualsense: v })}
        />

        <div>
          <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 8 }}>
            Resolution
          </label>
          <select
            value={settings.resolution}
            onChange={(e) => onUpdate({ resolution: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: theme.colors.bgCard,
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: theme.radius.small,
              color: theme.colors.textPrimary,
              fontSize: 14,
              fontFamily: 'inherit',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="540p">540p</option>
          </select>
          <p style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 6 }}>
            Stream resolution quality
          </p>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: 12, color: theme.colors.textMuted, textAlign: 'center' }}>
            Chiaki PS5 Launcher v1.0
          </p>
        </div>
      </motion.div>
    </>
  )
}

function SettingToggle({ label, description, value, onChange }: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}): React.ReactElement {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        cursor: 'pointer',
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>{description}</div>
      </div>
      <div style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: value ? theme.colors.accent : 'rgba(255,255,255,0.1)',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}>
        <div style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: 3,
          left: value ? 23 : 3,
          transition: 'left 0.2s',
        }} />
      </div>
    </div>
  )
}
