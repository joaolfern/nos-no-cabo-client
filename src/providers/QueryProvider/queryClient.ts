import { QueryClient } from '@tanstack/react-query'

// Each API call counts toward the Workers daily request limit, so revisits within a minute and
// returning from a "Visitar site" tab reuse what's already loaded.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false },
  },
})
