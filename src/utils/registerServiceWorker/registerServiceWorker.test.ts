const registerSW = vi.fn()

vi.mock('virtual:pwa-register', () => ({ registerSW }))

async function loadWithMocks(enableMocks: boolean) {
  vi.resetModules()
  vi.doMock('@/config/env', () => ({ ENABLE_MOCKS: enableMocks }))
  return import('@/utils/registerServiceWorker/registerServiceWorker')
}

describe('registerServiceWorker', () => {
  beforeEach(() => {
    registerSW.mockReset()
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {},
    })
  })

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'serviceWorker')
  })

  it("leaves the scope to MSW's worker while mocks are on", async () => {
    const { registerServiceWorker } = await loadWithMocks(true)

    registerServiceWorker(vi.fn())

    expect(registerSW).not.toHaveBeenCalled()
  })

  it('registers once and hands over the update when a new version waits', async () => {
    const updateServiceWorker = vi.fn()
    registerSW.mockReturnValue(updateServiceWorker)
    const { registerServiceWorker } = await loadWithMocks(false)
    const onUpdateReady = vi.fn()

    registerServiceWorker(onUpdateReady)
    registerServiceWorker(onUpdateReady)
    registerSW.mock.calls[0][0].onNeedRefresh()
    onUpdateReady.mock.calls[0][0]()

    expect(registerSW).toHaveBeenCalledOnce()
    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })
})
