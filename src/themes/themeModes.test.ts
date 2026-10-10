import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { themeColor } from '@/themes/themeModes'

function inlineThemeColors() {
  const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8')
  const block = html.match(/THEME_COLORS = \{([^}]*)\}/)?.[1] ?? ''
  return Object.fromEntries(
    [...block.matchAll(/(\w+): '(#[\da-fA-F]+)'/g)].map(([, mode, color]) => [
      mode,
      color,
    ])
  )
}

describe('themeColor', () => {
  it("matches index.html's inline copy, which paints the bar before React loads", () => {
    expect(inlineThemeColors()).toEqual({
      light: themeColor('light'),
      dark: themeColor('dark'),
      dimmed: themeColor('dimmed'),
    })
  })
})
