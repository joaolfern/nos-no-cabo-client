import { useMemo } from 'react'
import { useWebsites } from '@/pages/Feed/hooks/useWebsites'

export function useAdjacentWebsites(currentId: string) {
  const { websitesRaw } = useWebsites()

  return useMemo(() => {
    if (!websitesRaw?.length) {
      return { previous: null, next: null, random: null }
    }

    const index = websitesRaw.findIndex((website) => website.id === currentId)
    const others = websitesRaw.filter((website) => website.id !== currentId)

    return {
      previous: index > 0 ? websitesRaw[index - 1] : null,
      next:
        index !== -1 && index < websitesRaw.length - 1
          ? websitesRaw[index + 1]
          : null,
      random: others.length
        ? others[Math.floor(Math.random() * others.length)]
        : null,
    }
  }, [websitesRaw, currentId])
}
