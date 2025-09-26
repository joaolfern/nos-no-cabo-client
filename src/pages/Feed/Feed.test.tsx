import { MOCK_KEYWORDS } from '@/__mocks__/data/keywords'
import { render } from '@/__tests__/utils.test'
import { Feed } from '@/pages/Feed/Feed'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

describe('Feed', () => {
  it('should render', () => {
    render(<Feed />)

    expect(screen.getByTestId('feed')).toBeInTheDocument()
  })

  it('Should filter by keyword', async () => {
    window.innerWidth = 500

    render(<Feed />)

    const keywordButton = screen.getByRole('button', {
      name: 'Palavras-chave',
    })

    await userEvent.click(keywordButton)

    const keyword1Button = screen.getByRole('button', {
      name: MOCK_KEYWORDS[0].name,
    })
    const keyword2Button = screen.getByRole('button', {
      name: MOCK_KEYWORDS[1].name,
    })

    expect(keyword1Button).toBeInTheDocument()
    expect(keyword2Button).toBeInTheDocument()

    await userEvent.click(keyword1Button)

    const websitesFilteredByKeyword1 = screen.getAllByTestId('feed-card')

    websitesFilteredByKeyword1.forEach((website) => {
      expect(website).toHaveTextContent(MOCK_KEYWORDS[0].name)
    })
  })
})
