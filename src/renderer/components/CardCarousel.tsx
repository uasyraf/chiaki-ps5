import React, { useRef, useEffect } from 'react'
import { ConsoleCard } from './ConsoleCard'

interface HostInfo {
  id: string
  nickname: string
  hostAddress: string
  isPS5: boolean
  isRegistered: boolean
  state: 'online' | 'standby' | 'offline'
  registKey: string
}

interface CardCarouselProps {
  hosts: HostInfo[]
  selectedIndex: number
  onSelect: (index: number) => void
  onConnect: (host: HostInfo) => void
  onWake: (host: HostInfo) => void
}

export function CardCarousel({ hosts, selectedIndex, onSelect, onConnect, onWake }: CardCarouselProps): React.ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const card = container.children[selectedIndex] as HTMLElement
    if (!card) return
    const offset = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2
    container.scrollTo({ left: offset, behavior: 'smooth' })
  }, [selectedIndex])

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        gap: 16,
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollSnapType: 'x mandatory',
        padding: '20px clamp(16px, 3vw, 40px)',
        width: '100%',
        justifyContent: hosts.length <= 3 ? 'center' : 'flex-start',
      }}
    >
      {hosts.map((host, i) => (
        <div key={host.id} style={{ scrollSnapAlign: 'center' }}>
          <ConsoleCard
            host={host}
            selected={i === selectedIndex}
            onSelect={() => onSelect(i)}
            onConnect={() => onConnect(host)}
            onWake={() => onWake(host)}
          />
        </div>
      ))}
    </div>
  )
}
