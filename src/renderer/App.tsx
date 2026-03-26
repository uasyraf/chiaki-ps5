import React, { useState } from 'react'
import { StatusBar } from './components/StatusBar'
import { CardCarousel } from './components/CardCarousel'
import { ControlBar } from './components/ControlBar'
import { SettingsPanel } from './components/SettingsPanel'
import { EmptyState } from './components/EmptyState'
import { ToastContainer } from './components/Toast'
import { AddConsoleModal } from './components/AddConsoleModal'
import { PsnLoginModal } from './components/PsnLoginModal'
import { useHosts } from './hooks/useHosts'
import { useGamepad } from './hooks/useGamepad'
import { useSettings } from './hooks/useSettings'
import { useToast } from './hooks/useToast'

declare global {
  interface Window {
    electronAPI: any
  }
}

export function App(): React.ReactElement {
  const { toasts, showToast, dismissToast } = useToast()
  const { hosts, selectedIndex, setSelectedIndex, connect, wake, discover, refresh, addHost, removeHost } = useHosts(showToast)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [addConsoleOpen, setAddConsoleOpen] = useState(false)
  const [psnModalOpen, setPsnModalOpen] = useState(false)
  const [settings, updateSettings] = useSettings()

  useGamepad({
    onLeft: () => setSelectedIndex(Math.max(0, selectedIndex - 1)),
    onRight: () => setSelectedIndex(Math.min(hosts.length - 1, selectedIndex + 1)),
    onCross: () => {
      const host = hosts[selectedIndex]
      if (host) {
        if (host.state === 'online') connect(host)
        else if (host.state === 'offline' && host.isRegistered) wake(host)
      }
    },
    onTriangle: () => setSettingsOpen(!settingsOpen),
    onOptions: () => discover()
  })

  return (
    <div className="app">
      <div className="particles" />
      <div className="drag-region" />
      <StatusBar
        hostCount={hosts.length}
        onlineCount={hosts.filter(h => h.state === 'online').length}
      />
      <main className="content">
        {hosts.length > 0 ? (
          <CardCarousel
            hosts={hosts}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onConnect={connect}
            onWake={wake}
          />
        ) : (
          <EmptyState
            onDiscover={discover}
            onAddManually={() => setAddConsoleOpen(true)}
            onPsnRegister={() => setPsnModalOpen(true)}
          />
        )}
      </main>
      <ControlBar
        onDiscover={discover}
        onRefresh={refresh}
        onAddConsole={() => setAddConsoleOpen(true)}
        onPsnRegister={() => setPsnModalOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onQuit={() => window.electronAPI.app.quit()}
      />
      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
      <AddConsoleModal
        open={addConsoleOpen}
        onClose={() => setAddConsoleOpen(false)}
        onAdd={addHost}
      />
      <PsnLoginModal
        open={psnModalOpen}
        onClose={() => setPsnModalOpen(false)}
        onHostsChanged={refresh}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
