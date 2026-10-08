import { useCallback } from 'react'
import { useTheme } from '@/hooks/useTheme'

const WAVE_DURATION = 500
const WAVE_EASING = 'ease-in-out'
const VIEWPORT_PROBE = 'theme-wave-viewport'

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
      const probe = createViewportProbe()
      const transition = document.startViewTransition(applyTheme)
      const removeProbe = () => probe.remove()

      transition.ready.then(
        () => animateWave(origin, viewportInSnapshot(probe)),
        noop
      )
      transition.finished.then(removeProbe, removeProbe)
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

// The snapshot the wave clips starts under a visible mobile address bar, while
// click coordinates start below it, and no API exposes that offset. A probe
// pinned to the viewport's top-left reveals it through its group keyframes.
function createViewportProbe() {
  document.getElementById(VIEWPORT_PROBE)?.remove()
  const probe = document.createElement('div')
  probe.id = VIEWPORT_PROBE
  probe.style.cssText = `position: fixed; top: 0; left: 0; width: 1px; height: 100lvh; pointer-events: none; view-transition-name: ${VIEWPORT_PROBE}`
  document.body.append(probe)
  return probe
}

function viewportInSnapshot(probe: HTMLElement) {
  const group = document
    .getAnimations()
    .map((animation) => animation.effect)
    .find(
      (effect) =>
        effect instanceof KeyframeEffect &&
        effect.pseudoElement === `::view-transition-group(${VIEWPORT_PROBE})`
    ) as KeyframeEffect | undefined
  const transform = group?.getKeyframes().at(-1)?.transform
  const offsetTop =
    typeof transform === 'string' ? new DOMMatrixReadOnly(transform).m42 : 0
  const largeViewport = probe.getBoundingClientRect().height

  return {
    offsetTop,
    height: Math.max(largeViewport, offsetTop + window.innerHeight),
  }
}

type SnapshotViewport = ReturnType<typeof viewportInSnapshot>

function animateWave(click: Point, { offsetTop, height }: SnapshotViewport) {
  const x = click.x
  const y = click.y + offsetTop
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, height - y)
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
