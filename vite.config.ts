/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'
import svgr from 'vite-plugin-svgr'
import { pageMetaPlugin } from './scripts/vitePageMetaPlugin'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    svgr(),
    pageMetaPlugin(),
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
