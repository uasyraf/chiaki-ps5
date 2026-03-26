import { useEffect, useRef } from 'react'

interface GamepadActions {
  onLeft: () => void
  onRight: () => void
  onCross: () => void
  onTriangle: () => void
  onOptions: () => void
}

export function useGamepad(actions: GamepadActions): void {
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  const pressedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    let raf: number

    const poll = () => {
      const gamepads = navigator.getGamepads()
      for (const gp of gamepads) {
        if (!gp) continue

        const mapping: [number, string, () => void][] = [
          [14, 'left', () => actionsRef.current.onLeft()],
          [15, 'right', () => actionsRef.current.onRight()],
          [0, 'cross', () => actionsRef.current.onCross()],
          [3, 'triangle', () => actionsRef.current.onTriangle()],
          [9, 'options', () => actionsRef.current.onOptions()],
        ]

        for (const [btnIdx, name, handler] of mapping) {
          const btn = gp.buttons[btnIdx]
          if (btn?.pressed && !pressedRef.current.has(name)) {
            pressedRef.current.add(name)
            handler()
          } else if (!btn?.pressed) {
            pressedRef.current.delete(name)
          }
        }

        const lx = gp.axes[0] || 0
        if (lx < -0.5 && !pressedRef.current.has('stick-left')) {
          pressedRef.current.add('stick-left')
          actionsRef.current.onLeft()
        } else if (lx > -0.3) {
          pressedRef.current.delete('stick-left')
        }
        if (lx > 0.5 && !pressedRef.current.has('stick-right')) {
          pressedRef.current.add('stick-right')
          actionsRef.current.onRight()
        } else if (lx < 0.3) {
          pressedRef.current.delete('stick-right')
        }

        break
      }

      raf = requestAnimationFrame(poll)
    }

    raf = requestAnimationFrame(poll)
    return () => cancelAnimationFrame(raf)
  }, [])
}
