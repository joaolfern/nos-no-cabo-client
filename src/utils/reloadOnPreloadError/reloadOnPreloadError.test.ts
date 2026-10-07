import { reloadOnPreloadError } from '@/utils/reloadOnPreloadError/reloadOnPreloadError'

function dispatchPreloadError() {
  const event = new Event('vite:preloadError', { cancelable: true })
  window.dispatchEvent(event)
  return event
}

describe('reloadOnPreloadError', () => {
  const reload = vi.fn()
  let stopListening: () => void

  beforeEach(() => {
    sessionStorage.clear()
    reload.mockClear()
    vi.stubGlobal('location', { ...window.location, reload })
    stopListening = reloadOnPreloadError()
  })

  afterEach(() => {
    stopListening()
    vi.unstubAllGlobals()
  })

  it('reloads the page when a chunk fails to load', () => {
    const event = dispatchPreloadError()

    expect(reload).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
  })

  it('lets the error through instead of reloading in a loop', () => {
    dispatchPreloadError()
    const secondEvent = dispatchPreloadError()

    expect(reload).toHaveBeenCalledOnce()
    expect(secondEvent.defaultPrevented).toBe(false)
  })
})
