import { useCallback } from 'react'
import { useTheme } from '@/hooks/useTheme'

const WAVE_DURATION = 500
const WAVE_EASING = 'ease-in-out'

type Point = { x: number; y: number }

// Wraps the theme toggle in a circular "wave" reveal expanding from the
// click point, using the View Transitions API. Falls back to today's
// instant swap when the API is unsupported, the app's own animations
// toggle is off, or the OS asks for reduced motion.
export function useThemeToggleTransition() {
  const { nextMode, updateThemeMode, animationsEnabled } = useTheme()

  const toggleTheme = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const applyTheme = () => updateThemeMode(nextMode)

      if (!canAnimateWave(animationsEnabled)) {
        applyTheme()
        return
      }

      const origin = originOf(event)
      const transition = document.startViewTransition(applyTheme)

      transition.ready.then(() => animateWave(origin), noop)
    },
    [nextMode, updateThemeMode, animationsEnabled]
  )

  return { toggleTheme }
}

function canAnimateWave(animationsEnabled: boolean) {
  return (
    animationsEnabled &&
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// A keyboard-activated click reports (0, 0), so the wave falls back to the
// button's own center instead of the viewport corner.
function originOf(event: React.MouseEvent<HTMLElement>): Point {
  const { clientX, clientY, currentTarget } = event

  if (clientX === 0 && clientY === 0) {
    const rect = currentTarget.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  return { x: clientX, y: clientY }
}

function animateWave({ x, y }: Point) {
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  document.documentElement.animate(
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${radius}px at ${x}px ${y}px)`,
      ],
    },
    {
      duration: WAVE_DURATION,
      easing: WAVE_EASING,
      pseudoElement: '::view-transition-new(root)',
    }
  )
}

// The transition can be skipped, e.g. the tab was hidden mid-toggle; the
// theme is already applied by the callback passed to startViewTransition
// either way, so there is nothing to recover from here.
function noop() {}
