import { useEffect } from 'react'
import { useBlocker, type Location } from 'react-router'

type LeavingTransition = {
  currentLocation: Location
  nextLocation: Location
}

function isSubmittedNavigation(location: Location) {
  return (location.state as { submitted?: boolean } | null)?.submitted === true
}

function keepPageOnUnload(event: BeforeUnloadEvent) {
  event.preventDefault()
}

// Holds in-app navigation for a confirmation and asks the browser to confirm reloads and tab closes.
export function useLeaveFormPrompt(isDirty: boolean) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }: LeavingTransition) =>
      isDirty &&
      currentLocation.pathname !== nextLocation.pathname &&
      !isSubmittedNavigation(nextLocation)
  )

  useEffect(() => {
    if (!isDirty) return
    window.addEventListener('beforeunload', keepPageOnUnload)
    return () => window.removeEventListener('beforeunload', keepPageOnUnload)
  }, [isDirty])

  return blocker
}
