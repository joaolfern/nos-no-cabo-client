import { useSpring, animated } from '@react-spring/web'
import React, { useState, useRef, useEffect } from 'react'

interface RippleProps {
  spawnData: { x: number; y: number } | null
  duration?: number
  style?: React.CSSProperties
}

function Ripple({ spawnData, duration = 800, style = {} }: RippleProps) {
  const [data, setData] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const isInit = useRef(true)
  const rippleEl = useRef<HTMLSpanElement>(null)
  const props = useSpring({
    from: {
      ...style,
      ...data,
      transform: 'scale(0)',
      opacity: 1,
    },
    to: !isInit.current ? { opacity: 0, transform: 'scale(3)' } : {},
    config: { duration },
    reset: true,
  })

  useEffect(() => {
    if (isInit.current) {
      isInit.current = false
    } else {
      const parentEl = rippleEl.current?.parentElement
      if (!parentEl) return
      const size = Math.max(parentEl.offsetWidth, parentEl.offsetHeight)
      setData({
        width: size,
        height: size,
        top: (spawnData?.y ?? 0) - size / 2,
        left: (spawnData?.x ?? 0) - size / 2,
      })
    }
  }, [spawnData])

  return <animated.span className='g-ripple' style={props} ref={rippleEl} />
}

export { Ripple }
