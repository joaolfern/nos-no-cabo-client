import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { render } from '@/__tests__/utils.test'
import { getMockReports, resetMockReports } from '@/__mocks__/data/reports'
import { server } from '@/__mocks__/node'
import { V1_API_URL } from '@/config/env'
import { ReportButton } from '@/pages/Webring/components/ReportButton/ReportButton'

async function openDialog() {
  await render(<ReportButton id='1' name='Querido Diário' />)
  await userEvent.click(
    screen.getByRole('button', { name: 'Notificar problema' })
  )
  return screen.getByRole('dialog', {
    name: 'Notificar problema com Querido Diário',
  })
}

beforeEach(resetMockReports)

describe('ReportButton', () => {
  it('sends the chosen reason and comment, then thanks the person', async () => {
    const dialog = await openDialog()

    await userEvent.click(
      within(dialog).getByRole('radio', { name: 'Spam ou golpe' })
    )
    await userEvent.type(
      within(dialog).getByLabelText('Detalhes (opcional)'),
      'Só propaganda'
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Enviar denúncia' })
    )

    expect(
      await screen.findByText('Obrigado. Vamos analisar a denúncia.')
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(getMockReports('1')).toEqual([
      { reason: 'spam', comment: 'Só propaganda' },
    ])
  })

  it('asks for a reason before sending', async () => {
    const dialog = await openDialog()

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Enviar denúncia' })
    )

    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'Escolha um motivo.'
    )
    expect(getMockReports('1')).toEqual([])
  })

  it('explains a rate limit from the server', async () => {
    server.use(
      http.post(`${V1_API_URL}/websites/:id/reports`, () =>
        HttpResponse.json(
          { error: { code: 'rate_limited', message: 'Muitas tentativas.' } },
          { status: 429 }
        )
      )
    )
    const dialog = await openDialog()

    await userEvent.click(
      within(dialog).getByRole('radio', { name: 'Site fora do ar' })
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Enviar denúncia' })
    )

    expect(
      await within(dialog).findByText(/Muitas denúncias seguidas/)
    ).toBeInTheDocument()
  })
})
