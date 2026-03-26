import { spawn, ChildProcess, execSync } from 'child_process'

export class ProcessManager {
  private process: ChildProcess | null = null
  private currentHost: string = ''
  private onStreamEnd: ((code: number) => void) | null = null

  get isStreaming(): boolean {
    return this.process !== null
  }

  findBinary(): string {
    for (const name of ['chiaki', 'chiaki-ng']) {
      try {
        const result = execSync(`which ${name}`, { encoding: 'utf-8' }).trim()
        if (result) return result
      } catch { /* not found */ }
    }
    return 'chiaki'
  }

  startStream(
    nickname: string,
    host: string,
    options: { fullscreen?: boolean; dualsense?: boolean; passcode?: string } = {},
    onEnd: (code: number) => void
  ): void {
    if (this.isStreaming) return

    const binary = this.findBinary()
    const args = ['stream', nickname, host]

    if (options.fullscreen) args.push('--fullscreen')
    if (options.dualsense) args.push('--dualsense')
    if (options.passcode) args.push('--passcode', options.passcode)

    this.currentHost = host
    this.onStreamEnd = onEnd
    this.process = spawn(binary, args, { stdio: 'inherit' })

    this.process.on('close', (code) => {
      this.process = null
      this.currentHost = ''
      this.onStreamEnd?.(code ?? 1)
    })
  }

  wakeUp(nickname: string, host: string, registKey: string): void {
    const binary = this.findBinary()
    const args = ['wakeup', '--registkey', registKey, nickname, host]

    const proc = spawn(binary, args)
    proc.on('close', () => {}) // fire and forget
  }

  stopStream(): void {
    this.process?.kill('SIGTERM')
  }
}
