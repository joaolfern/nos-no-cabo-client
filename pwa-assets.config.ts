import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

const BADGE_BACKGROUND = '#1a0d2e'

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, favicons: [] },
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { background: BADGE_BACKGROUND },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { background: BADGE_BACKGROUND },
    },
  },
  images: ['public/logos/logo.svg'],
})
