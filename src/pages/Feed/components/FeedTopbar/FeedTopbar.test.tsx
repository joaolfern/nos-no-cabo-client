import { render } from '@/__tests__/utils.test'
import { FeedTopbar } from '@/pages/Feed/components/FeedTopbar/FeedTopbar'
import { screen } from '@testing-library/dom'

describe('FeedTopBar', () => {
  it('It should render', () => {
    render(<FeedTopbar />)

    screen.getByTestId('feed-top-bar')
  })

  describe('#Mobile', () => {
    it('Should render filters', () => {
      window.innerWidth = 500
      render(<FeedTopbar />)

      screen.getByRole('button', { name: 'Palavras-chave' })
    })
  })
})
