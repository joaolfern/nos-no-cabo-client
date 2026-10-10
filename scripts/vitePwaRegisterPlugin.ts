import type { Plugin } from 'vite'

const REGISTER_SCRIPT = `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')`

// PWABuilder only finds the registration in the HTML itself; MSW owns the scope while mocks are on.
export function pwaRegisterPlugin(): Plugin {
  let isMocked = true

  return {
    name: 'nnc-pwa-register',
    configResolved(config) {
      isMocked = config.env.VITE_ENABLE_MOCKS !== 'false'
    },
    transformIndexHtml() {
      if (isMocked) return
      return [{ tag: 'script', children: REGISTER_SCRIPT, injectTo: 'body' }]
    },
  }
}
