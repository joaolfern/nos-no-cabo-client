import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { render } from '@/__tests__/utils.test'
import { server } from '@/__mocks__/node'
import { API_URL } from '@/config/env'
import { VerifyPanel } from '@/pages/WidgetEditor/components/VerifyPanel/VerifyPanel'

const verifyButton = () => screen.getByRole('button', { name: 'Verificar' })

describe('VerifyPanel', () => {
  it('links to the widget editor', async () => {
    await render(<VerifyPanel websiteId='5' websiteName='Site' />)

    expect(
      screen.getByRole('link', { name: 'Adicionar o selo' })
    ).toHaveAttribute('href', '/websites/5/selo')
  })

  it('confirms when the widget is found', async () => {
    await render(<VerifyPanel websiteId='2' websiteName='Conjuntura' />)

    await userEvent.click(verifyButton())

    expect(
      await screen.findByText('Selo encontrado. Conjuntura agora é verificado.')
    ).toBeInTheDocument()
  })

  it('explains when the widget is missing', async () => {
    await render(<VerifyPanel websiteId='5' websiteName='Site' />)

    await userEvent.click(verifyButton())

    expect(
      await screen.findByText(/Não encontramos o selo no site/)
    ).toBeInTheDocument()
  })

  it('asks to wait when rate limited', async () => {
    server.use(
      http.post(`${API_URL}/v1/websites/:id/verify`, () =>
        HttpResponse.json(
          { error: { code: 'rate_limited', message: 'Calma' } },
          { status: 429 }
        )
      )
    )
    await render(<VerifyPanel websiteId='5' websiteName='Site' />)

    await userEvent.click(verifyButton())

    expect(
      await screen.findByText('Aguarde um minuto antes de verificar de novo.')
    ).toBeInTheDocument()
  })
})
