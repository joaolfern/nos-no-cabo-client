// The observer's first call comes after the browser's own layout, so measuring there forces none.
export function observeSize(element: Element | null, onResize: () => void) {
  if (!element || typeof ResizeObserver === 'undefined') {
    onResize()
    return () => {}
  }

  const observer = new ResizeObserver(onResize)
  observer.observe(element)
  return () => observer.disconnect()
}
