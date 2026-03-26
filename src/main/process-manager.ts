import { spawn, ChildProcess, execSync } from 'child_process'
import { IpcResult } from './types'

export class ProcessManager {
  private process: ChildProcess | null = null
  private currentHost: string = ''
  private onStreamEnd: ((code: number) => void) | null = null

  get isStreaming(): boolean {
    return this.process !== null
  }

  findBinary(): string | null {
    for (const name of ['chiaki', 'chiaki-ng']) {
      try {
        const result = execSync(`which ${name}`, { encoding: 'utf-8' }).trim()
        if (result) return result
      } catch { /* not found */ }
    }
    return null
  }

  startStream(
    nickname: string,
    host: string,
    options: { fullscreen?: boolean; dualsense?: boolean; passcode?: string } = {},
    onEnd: (code: number) => void
  ): IpcResult {
    if (this.isStreaming) return { success: false, error: 'A stream is already active' }

    const binary = this.findBinary()
    if (!binary) return { success: false, error: 'chiaki/chiaki-ng not found in PATH' }

    const args = ['stream', nickname, host]
    if (options.fullscreen) args.push('--fullscreen')
    if (options.dualsense) args.push('--dualsense')
    if (options.passcode) args.push('--passcode', options.passcode)

    this.currentHost = host
    this.onStreamEnd = onEnd

    try {
      this.process = spawn(binary, args, { stdio: 'inherit' })
    } catch (err) {
      this.process = null
      this.currentHost = ''
      return { success: false, error: `Failed to launch ${binary}: ${err instanceof Error ? err.message : String(err)}` }
    }

    this.process.on('error', (err) => {
      this.process = null
      this.currentHost = ''
      this.onStreamEnd?.(-1)
    })

    this.process.on('close', (code) => {
      this.process = null
      this.currentHost = ''
      this.onStreamEnd?.(code ?? 1)
    })

    return { success: true }
  }

  wakeUp(nickname: string, host: string, registKey: string): Promise<IpcResult> {
    return new Promise((resolve) => {
      const binary = this.findBinary()
      if (!binary) {
        resolve({ success: false, error: 'chiaki/chiaki-ng not found in PATH' })
        return
      }

      const args = ['wakeup', '--host', host, '--registkey', registKey]
      let stdout = ''
      let stderr = ''

      const proc = spawn(binary, args)
      proc.stdout?.on('data', (data: Buffer) => { stdout += data.toString() })
      proc.stderr?.on('data', (data: Buffer) => { stderr += data.toString() })

      proc.on('error', (err) => {
        resolve({ success: false, error: `Failed to launch ${binary}: ${err.message}` })
      })

      proc.on('close', (code) => {
        if (code === 0) {
          const message = stdout.trim() || 'Wake signal sent'
          resolve({ success: true, message })
        } else {
          const msg = stderr.trim() || `Process exited with code ${code}`
          resolve({ success: false, error: msg })
        }
      })
    })
  }

  stopStream(): void {
    this.process?.kill('SIGTERM')
  }
}
