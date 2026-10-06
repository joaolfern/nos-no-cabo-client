import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/__tests__/utils.test'
import { TopbarActions } from '@/layouts/NosNoCaboLayout/components/TopbarActions/TopbarActions'
import { THEME_VARIABLES } from '@/themes/themeModes'

const pageBackground = () =>
  document.documentElement.style.getPropertyValue('--color-background-100')

beforeEach(() => localStorage.setItem('themeMode', 'dark'))
afterEach(() => localStorage.clear())

describe('TopbarActions theme button', () => {
  it('offers dimmed only after the visitor has used dark and light', async () => {
    await render(<TopbarActions />)

    for (const [label, mode] of [
      ['Usar tema claro', 'light'],
      ['Usar tema escuro', 'dark'],
      ['Usar tema suave', 'dimmed'],
      ['Usar tema claro', 'light'],
      ['Usar tema escuro', 'dark'],
    ] as const) {
      await userEvent.click(screen.getByRole('button', { name: label }))

      expect(pageBackground()).toBe(
        THEME_VARIABLES[mode]['color-background-100']
      )
      expect(localStorage.getItem('themeMode')).toBe(mode)
    }
  })

  it('goes straight to dimmed for a visitor who already unlocked it', async () => {
    localStorage.setItem('dimmedThemeUnlocked', 'true')
    await render(<TopbarActions />)

    expect(
      screen.getByRole('button', { name: 'Usar tema suave' })
    ).toBeInTheDocument()
  })
})
