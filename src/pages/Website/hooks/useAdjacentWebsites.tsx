import { useNeighboursData } from '@/hooks/useDataHooks'

const NO_NEIGHBOURS = { previous: null, next: null, random: null }

// Previous and next in the ring order, plus a random site, from the server.
export function useAdjacentWebsites(currentId: string) {
  const { data } = useNeighboursData(currentId)
  return data ?? NO_NEIGHBOURS
}
