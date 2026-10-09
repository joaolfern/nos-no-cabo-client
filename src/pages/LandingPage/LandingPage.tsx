import { usePageMeta } from '@/hooks/usePageMeta'
import { BubblyContainer } from './components/BubblyContainer/BubblyContainer'
import { LandingShell } from './components/LandingShell/LandingShell'
import { useRingBubbles } from './hooks/useRingBubbles'

export function LandingPage() {
  usePageMeta({ path: '/' })
  const bubbles = useRingBubbles()

  return <LandingShell background={<BubblyContainer items={bubbles} />} />
}
