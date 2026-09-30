import { useSyncExternalStore } from 'react'
import { FEED_PAGE_SIZE, FEED_PAGE_SIZE_LARGE } from '@/constants/post'

const LARGE_DESKTOP_QUERY = '(min-width: 1440px)'

function subscribe(onChange: () => void) {
  const query = window.matchMedia?.(LARGE_DESKTOP_QUERY)
  query?.addEventListener('change', onChange)
  return () => query?.removeEventListener('change', onChange)
}

function getPageSize() {
  return window.matchMedia?.(LARGE_DESKTOP_QUERY).matches
    ? FEED_PAGE_SIZE_LARGE
    : FEED_PAGE_SIZE
}

export function useFeedPageSize() {
  return useSyncExternalStore(subscribe, getPageSize, () => FEED_PAGE_SIZE)
}
