import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LuLayers } from 'react-icons/lu'
import { CategoryList } from './CategoryList'

const options = [
  { label: 'Saúde', value: 's', Icon: LuLayers },
  { label: 'Educação', value: 'e', Icon: LuLayers },
]
const counts = new Map([
  ['s', 3],
  ['e', 2],
])

function setup(props: Partial<React.ComponentProps<typeof CategoryList>> = {}) {
  const onSelect = vi.fn()

  render(
    <CategoryList
      options={options}
      counts={counts}
      total={5}
      selected={null}
      loading={false}
      onSelect={onSelect}
      {...props}
    />
  )

  return { onSelect }
}

describe('CategoryList', () => {
  it('shows the total and the count of each category', () => {
    setup()

    expect(screen.getByRole('button', { name: /Todos/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: /Saúde/ })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('selects a category', async () => {
    const { onSelect } = setup()

    await userEvent.click(screen.getByRole('button', { name: /Educação/ }))

    expect(onSelect).toHaveBeenCalledWith('e')
  })

  it('marks only the selected category as active', () => {
    setup({ selected: 's' })

    expect(screen.getByRole('button', { name: /Saúde/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: /Todos/ })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('goes back to every category with "Todos"', async () => {
    const { onSelect } = setup({ selected: 's' })

    await userEvent.click(screen.getByRole('button', { name: /Todos/ }))

    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('explains when nothing matches', () => {
    setup({ options: [] })

    expect(
      screen.getByText('Nenhuma palavra-chave encontrada')
    ).toBeInTheDocument()
  })

  describe('when not every category fits', () => {
    const manyOptions = ['a', 'b', 'c', 'd', 'e', 'f'].map((value) => ({
      label: `cat-${value}`,
      value,
      Icon: LuLayers,
    }))

    it('moves the rest into "Mais categorias"', async () => {
      const { onSelect } = setup({ options: manyOptions, maxRows: 5 })

      expect(screen.getByRole('button', { name: /cat-c/ })).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /cat-d/ })
      ).not.toBeInTheDocument()

      await userEvent.click(
        screen.getByRole('button', { name: /Mais categorias/ })
      )
      await userEvent.click(screen.getByRole('option', { name: /cat-f/ }))

      expect(onSelect).toHaveBeenCalledWith('f')
    })

    it('keeps a hidden selected category in view', () => {
      setup({ options: manyOptions, maxRows: 5, selected: 'f' })

      expect(screen.getByRole('button', { name: /cat-f/ })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    })
  })
})
