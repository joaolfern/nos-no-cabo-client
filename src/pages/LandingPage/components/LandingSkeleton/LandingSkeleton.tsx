import { LandingShell } from '@/pages/LandingPage/components/LandingShell/LandingShell'

// The hero is static, so while the page's chunk loads it shows as is; the bubbles arrive with the chunk.
export function LandingSkeleton() {
  return <LandingShell />
}
