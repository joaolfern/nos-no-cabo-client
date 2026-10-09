/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'
import { pageMetaPlugin } from './scripts/vitePageMetaPlugin'

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
      manifest: {
        id: '/',
        name: 'Nós no Cabo',
        short_name: 'Nós no Cabo',
        description:
          'Webring de projetos brasileiros de tecnologia: descubra sites de educação, saúde, cidades e mais, e adicione o seu.',
        lang: 'pt-BR',
        start_url: '/websites',
        scope: '/',
        display: 'standalone',
        background_color: '#fbfafb',
        theme_color: '#fbfafb',
        icons: [
          {
            src: '/logos/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: '/logos/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logos/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/logos/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      includeManifestIcons: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // browser-*.js is MSW's chunk (src/__mocks__/browser.ts), only loaded with mocks on.
        globIgnores: ['mockServiceWorker.js', 'og.png', 'assets/browser-*.js'],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': path.resolve(__dirname, 'src'),
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
