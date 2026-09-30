import { render } from '@/__tests__/utils.test'
import { getCategoryMeta } from '@/pages/Feed/constants/categories'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KeywordsStep } from './KeywordsStep'

const saude = getCategoryMeta('saude')
const educacao = getCategoryMeta('educacao')

async function setup() {
  await render(
    <KeywordsStep
      updateStep={jest.fn()}
      setPreregister={jest.fn()}
      preregister={null}
      onSuccess={jest.fn()}
    />
  )

  return {
    chip: async (label: string) =>
      screen.findByRole('checkbox', { name: label }),
    save: () => screen.getByRole('button', { name: 'Salvar' }),
  }
}

describe('KeywordsStep', () => {
  it('lists every category as a chip without descriptions', async () => {
    await setup()

    expect(await screen.findAllByRole('checkbox')).toHaveLength(11)
    expect(screen.queryByText(saude.description)).not.toBeInTheDocument()
  })

  it('shows the description of the selected category', async () => {
    const { chip } = await setup()

    await userEvent.click(await chip(saude.label))

    expect(await chip(saude.label)).toBeChecked()
    expect(screen.getByText(saude.description)).toBeInTheDocument()
  })

  it('falls back to the previous selection when the last one is removed', async () => {
    const { chip } = await setup()

    await userEvent.click(await chip(educacao.label))
    await userEvent.click(await chip(saude.label))
    await userEvent.click(await chip(saude.label))

    expect(screen.getByText(educacao.description)).toBeInTheDocument()
    expect(screen.queryByText(saude.description)).not.toBeInTheDocument()
  })

  it('only allows saving once a category is selected', async () => {
    const { chip, save } = await setup()

    await chip(saude.label)
    expect(save()).toBeDisabled()

    await userEvent.click(await chip(saude.label))
    expect(save()).toBeEnabled()
  })
})
