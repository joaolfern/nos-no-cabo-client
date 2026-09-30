import { render } from '@/__tests__/utils.test'
import { FeedTopbar } from '@/pages/Feed/components/FeedTopbar/FeedTopbar'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

describe('FeedTopBar', () => {
  it('It should render', () => {
    render(<FeedTopbar />)

    screen.getByTestId('feed-top-bar')
  })

  describe('#Header', () => {
    it('shows every project when no category is selected', () => {
      render(<FeedTopbar total={3} />)

      screen.getByRole('heading', { name: 'Todos os projetos' })
      screen.getByText('Todos os sites da aliança, de todas as categorias.')
    })

    it('shows the filtered total', () => {
      render(<FeedTopbar total={3} />)

      screen.getByLabelText('3 projetos')
    })

    it('uses the singular for one project', () => {
      render(<FeedTopbar total={1} />)

      screen.getByLabelText('1 projeto')
    })
  })

  describe('#View toggle', () => {
    it('is only rendered when there is a handler', () => {
      render(<FeedTopbar />)

      expect(
        screen.queryByRole('group', { name: 'Modo de visualização' })
      ).toBe(null)
    })

    it('reports the chosen view', async () => {
      const onViewChange = jest.fn()
      render(<FeedTopbar view='grid' onViewChange={onViewChange} />)

      await userEvent.click(
        screen.getByRole('button', { name: 'Ver em lista' })
      )

      expect(onViewChange).toHaveBeenCalledWith('list')
    })
  })

  describe('#Mobile', () => {
    it('Should render filters', () => {
      window.innerWidth = 500
      render(<FeedTopbar />)

      screen.getByRole('button', { name: 'Palavras-chave' })
    })
  })
})
