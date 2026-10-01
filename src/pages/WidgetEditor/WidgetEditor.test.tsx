import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { render } from '@/__tests__/utils.test'
import { WidgetEditor } from '@/pages/WidgetEditor/WidgetEditor'

async function renderEditor(id = '4') {
  window.history.pushState({}, '', `/websites/${id}/selo`)
  await render(
    <Routes>
      <Route path='/websites/:id/selo' element={<WidgetEditor />} />
    </Routes>
  )
}

const code = () => screen.getByRole('region', { name: 'Código do selo' })

const termsCheckbox = () =>
  screen.getByRole('checkbox', { name: 'Li e concordo com os Termos de uso' })

describe('WidgetEditor', () => {
  beforeEach(() => localStorage.clear())

  it('names the site and starts with the Faixa snippet for it', async () => {
    await renderEditor()

    expect(
      await screen.findByText(/Com o selo no site, i-Educar ganha/)
    ).toBeInTheDocument()
    expect(within(code()).getByText(/data-nnc-widget="4"/)).toBeInTheDocument()
    expect(within(code()).getByText(/data-modelo="faixa"/)).toBeInTheDocument()
  })

  it('only offers the parameters the chosen preset supports', async () => {
    await renderEditor()

    await userEvent.click(screen.getByRole('radio', { name: 'Selo 88×31' }))
    expect(
      screen.queryByRole('group', { name: 'Anterior e Próximo' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Tema' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: 'Texto' }))
    expect(
      screen.queryByRole('group', { name: 'Tema' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('group', { name: 'Cor do logo' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/usa a fonte e as cores do seu site/)
    ).toBeInTheDocument()
  })

  it('updates the snippet from the parameters', async () => {
    await renderEditor()

    await userEvent.click(screen.getByRole('radio', { name: 'Escuro' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Verde' }))
    await userEvent.click(
      within(
        screen.getByRole('group', { name: 'Anterior e Próximo' })
      ).getByRole('radio', { name: 'Ocultar' })
    )

    const snippet = code().textContent ?? ''
    expect(snippet).toContain('data-tema="escuro"')
    expect(snippet).toContain('data-cor="verde"')
    expect(snippet).not.toContain('/ring/4/prev')
    expect(snippet).toContain('/ring/4/random')
  })

  it('previews on a dark site by default', async () => {
    await renderEditor()

    expect(screen.getByRole('button', { name: 'Site escuro' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('can hide Aleatório and change the logo', async () => {
    await renderEditor()

    await userEvent.click(
      within(screen.getByRole('group', { name: 'Aleatório' })).getByRole(
        'radio',
        { name: 'Ocultar' }
      )
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Original' }))

    const snippet = code().textContent ?? ''
    expect(snippet).not.toContain('/ring/4/random')
    expect(snippet).toContain('nnc-badge')
    expect(snippet).toContain('href="https://nosnocabo.pages.dev/"')
  })

  it('only enables the logo colour for the coloured logo', async () => {
    await renderEditor()

    const colour = screen.getByRole('group', { name: 'Cor do logo' })
    expect(colour).toBeEnabled()

    await userEvent.click(screen.getByRole('radio', { name: 'Gradiente' }))

    expect(colour).toBeDisabled()
    expect(code().textContent).not.toContain('data-cor')
  })

  it('explains what a custom widget must keep', async () => {
    await renderEditor()

    await userEvent.click(screen.getByRole('radio', { name: 'Personalizado' }))

    const guide = screen.getByRole('region', { name: 'Como montar o seu selo' })
    expect(within(guide).getByText('data-nnc-widget="4"')).toBeInTheDocument()
    expect(
      within(guide).getByText('https://nosnocabo.pages.dev/')
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Prévia num site' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('group', { name: 'Tema' })
    ).not.toBeInTheDocument()
    expect(code().textContent).toContain('Mantenha o atributo data-nnc-widget')
  })

  it('copies the snippet', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    await renderEditor()

    await userEvent.click(termsCheckbox())
    await userEvent.click(screen.getByRole('button', { name: 'Copiar código' }))

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining('data-nnc-widget="4"')
    )
    expect(
      await screen.findByRole('button', { name: 'Copiado' })
    ).toBeInTheDocument()
  })

  it('keeps the code collapsed until asked', async () => {
    await renderEditor()
    await userEvent.click(termsCheckbox())

    const toggle = screen.getByRole('button', { name: 'Ver código' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(code().querySelector('pre')).not.toBeVisible()

    await userEvent.click(toggle)

    expect(
      screen.getByRole('button', { name: 'Ocultar código' })
    ).toHaveAttribute('aria-expanded', 'true')
    expect(code().querySelector('pre')).toBeVisible()
  })

  it('locks the code until the terms are accepted, and remembers it', async () => {
    await renderEditor()

    expect(screen.getByRole('button', { name: 'Copiar código' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Ver código' })).toBeDisabled()

    await userEvent.click(termsCheckbox())

    expect(screen.getByRole('button', { name: 'Copiar código' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Ver código' })).toBeEnabled()

    cleanup()
    await renderEditor()
    expect(termsCheckbox()).toBeChecked()
  })

  it('removes the links to other sites in one click', async () => {
    await renderEditor()

    await userEvent.click(
      screen.getByRole('button', { name: 'Remover links de navegação' })
    )

    const snippet = code().textContent ?? ''
    expect(snippet).not.toContain('/ring/4/')
    expect(snippet).toContain('href="https://nosnocabo.pages.dev/"')
    expect(
      screen.queryByRole('button', { name: 'Remover links de navegação' })
    ).not.toBeInTheDocument()
  })

  it('accepts the terms from the terms modal', async () => {
    await renderEditor()

    await userEvent.click(screen.getByRole('button', { name: 'Termos de uso' }))
    expect(
      screen.getByRole('heading', { name: '4. Curadoria automática' })
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Li e concordo' }))

    expect(termsCheckbox()).toBeChecked()
    expect(
      screen.queryByRole('heading', { name: '4. Curadoria automática' })
    ).not.toBeInTheDocument()
  })

  it('says when the site does not exist', async () => {
    await renderEditor('nao-existe')

    expect(
      await screen.findByRole('heading', { name: 'Não encontramos esse site' })
    ).toBeInTheDocument()
  })
})
