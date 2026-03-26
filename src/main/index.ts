import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import { registerIpcHandlers } from './ipc-handlers'

app.commandLine.appendSwitch('ozone-platform-hint', 'auto')
app.commandLine.appendSwitch('enable-features', 'WaylandWindowDecorations')

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    backgroundColor: '#0e1117',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  registerIpcHandlers(() => mainWindow)
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}
