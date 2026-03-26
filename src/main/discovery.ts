import dgram from 'dgram'
import { HostInfo } from './types'

const DISCOVERY_PORT = 987
const DISCOVERY_INTERVAL = 5000

export class DiscoveryService {
  private socket: dgram.Socket | null = null
  private timer: NodeJS.Timeout | null = null
  private hosts: HostInfo[] = []
  private onUpdate: ((hosts: HostInfo[]) => void) | null = null

  start(hosts: HostInfo[], onUpdate: (hosts: HostInfo[]) => void): void {
    this.hosts = hosts
    this.onUpdate = onUpdate

    this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })
    this.socket.on('message', (_, rinfo) => this.handleResponse(rinfo.address))
    this.socket.bind(0, () => {
      this.socket?.setBroadcast(true)
      this.discover()
      this.timer = setInterval(() => this.discover(), DISCOVERY_INTERVAL)
    })
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    this.socket?.close()
    this.socket = null
    this.timer = null
  }

  updateHosts(hosts: HostInfo[]): void {
    this.hosts = hosts
  }

  discover(): void {
    const msg = Buffer.from('SRCH')
    this.socket?.send(msg, 0, msg.length, DISCOVERY_PORT, '255.255.255.255')
  }

  discoverOnce(timeoutMs = 3000): Promise<number> {
    return new Promise((resolve) => {
      const before = this.hosts.filter(h => h.state === 'online').length
      this.discover()
      setTimeout(() => {
        const after = this.hosts.filter(h => h.state === 'online').length
        resolve(after - before)
      }, timeoutMs)
    })
  }

  private handleResponse(senderIp: string): void {
    let changed = false
    for (const host of this.hosts) {
      if (host.hostAddress === senderIp && host.state !== 'online') {
        host.state = 'online'
        changed = true
      }
    }
    if (changed) {
      this.onUpdate?.(this.hosts)
    }
  }
}
