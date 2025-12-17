import { Ripple } from '@/components/Ripple/Ripple'
import { useState } from 'react'

export function withRipple<T>(WrappedComponent: React.ComponentType<T>) {
  return function WithRippleComponent(props: T) {
    const [rippleSpawnData, setRippleSpawnData] = useState<{
      x: number
      y: number
    } | null>(null)

    function handleMouseDown(event: React.MouseEvent) {
      const rect = (event.target as HTMLElement).getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      setRippleSpawnData({ x, y })
    }

    function handleMouseUp() {
      setRippleSpawnData(null)
    }

    return (
      <WrappedComponent
        {...props}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <Ripple spawnData={rippleSpawnData} />
      </WrappedComponent>
    )
  }
}
