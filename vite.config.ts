/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'
import { pageMetaPlugin } from './scripts/vitePageMetaPlugin.ts'
import { PWA_MANIFEST } from './scripts/pwaManifest.ts'
import { pwaRegisterPlugin } from './scripts/vitePwaRegisterPlugin.ts'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    svgr(),
    pageMetaPlugin(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/sw',
      filename: 'sw.ts',
      injectRegister: false,
      registerType: 'prompt',
      manifest: PWA_MANIFEST,
      includeManifestIcons: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // browser-*.js is MSW's chunk (src/__mocks__/browser.ts), only loaded with mocks on.
        globIgnores: [
          'mockServiceWorker.js',
          'og.png',
          'assets/browser-*.js',
          'fonts/openSans/OpenSansItalic.woff2',
          'screenshots/**',
        ],
        // Minifying turns 'push' into `push`, and PWABuilder's feature regexes only match quotes.
        minify: false,
      },
      devOptions: { enabled: false },
    }),
    pwaRegisterPlugin(),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    // Same origin as the mocked API URL, so jsdom's CORS checks don't block MSW.
    environmentOptions: { jsdom: { url: 'https://localhost:3000' } },
    // Node 25's own localStorage would shadow jsdom's.
    execArgv: ['--no-experimental-webstorage'],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
})
