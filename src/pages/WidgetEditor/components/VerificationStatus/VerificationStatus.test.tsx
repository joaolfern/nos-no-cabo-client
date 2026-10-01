import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/__tests__/utils.test'
import { VerificationStatus } from './VerificationStatus'

describe('VerificationStatus', () => {
  it('marks a verified site without a button', async () => {
    await render(
      <VerificationStatus
        websiteId='1'
        websiteName='Querido Diário'
        verifiedAt='2026-09-01T12:00:00.000Z'
      />
    )

    expect(screen.getByRole('img', { name: 'Verificado' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('explains an unverified site and links the owner to the widget editor', async () => {
    await render(
      <VerificationStatus
        websiteId='2'
        websiteName='Atados'
        verifiedAt={null}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Não verificado: saiba mais' })
    )

    expect(
      screen.getByRole('heading', { name: 'Atados ainda não foi verificado' })
    ).toBeInTheDocument()
    expect(screen.getByText(/feito pela comunidade/)).toBeInTheDocument()
    expect(
      screen.getByText(/prestigiar este e muitos outros projetos/)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Sou responsável pelo Atados/ })
    ).toHaveAttribute('href', '/websites/2/selo')

    await userEvent.click(screen.getByRole('button', { name: 'Entendi' }))

    expect(
      screen.queryByRole('heading', { name: /ainda não foi verificado/ })
    ).not.toBeInTheDocument()
  })
})
