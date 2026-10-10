import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTheme } from '@/hooks/useTheme'
import { ThemeProvider } from '@/providers/ThemeProvider/ThemeProvider'
import { themeColor } from '@/themes/themeModes'

function DarkButton() {
  const { updateThemeMode } = useTheme()
  return <button onClick={() => updateThemeMode('dark')}>Escuro</button>
}

function barColor() {
  return document
    .querySelector('meta[name="theme-color"]')
    ?.getAttribute('content')
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.setItem('themeMode', 'light')
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.append(meta)
  })

  afterEach(() => {
    document.head.querySelector('meta[name="theme-color"]')?.remove()
    localStorage.clear()
  })

  it('paints the browser bar with the current theme', async () => {
    render(
      <ThemeProvider>
        <DarkButton />
      </ThemeProvider>
    )
    expect(barColor()).toBe(themeColor('light'))

    await userEvent.click(screen.getByRole('button', { name: 'Escuro' }))

    expect(barColor()).toBe(themeColor('dark'))
  })
})
