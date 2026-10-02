import { render } from '@/__tests__/utils.test'
import { Feed } from '@/pages/Feed/Feed'
import { useSort } from '@/pages/Feed/hooks/useSort'
import { FEED_PAGE_SIZE } from '@/constants/post'
import { MOCK_WEBSITES } from '@/__mocks__/data/websites'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// The sort button lives in the top bar; the test drives the same state.
function SortControl() {
  const { updateSort } = useSort()

  return (
    <>
      <button onClick={() => updateSort('az')}>sort az</button>
      <button onClick={() => updateSort('melhores')}>sort melhores</button>
    </>
  )
}

const TOTAL = MOCK_WEBSITES.length
const REMAINING = TOTAL - FEED_PAGE_SIZE

async function loadMore() {
  await userEvent.click(
    screen.getByRole('button', { name: `Carregar mais ${REMAINING}` })
  )
  await waitFor(() =>
    expect(screen.getAllByTestId('feed-card')).toHaveLength(TOTAL)
  )
}

describe('Feed load more', () => {
  it('needs more mock websites than one batch, or these tests prove nothing', () => {
    expect(TOTAL).toBeGreaterThan(FEED_PAGE_SIZE)
  })

  it('shows the first batch of cards and how many there are in total', async () => {
    await render(<Feed />)

    expect(await screen.findAllByTestId('feed-card')).toHaveLength(
      FEED_PAGE_SIZE
    )
    expect(screen.getByText(/Mostrando/)).toHaveTextContent(
      `Mostrando ${FEED_PAGE_SIZE} de ${TOTAL}`
    )
  })

  it('appends the rest and hides the button once everything is shown', async () => {
    await render(<Feed />)
    await screen.findAllByTestId('feed-card')

    await loadMore()

    expect(
      screen.queryByRole('button', { name: /Carregar mais/ })
    ).not.toBeInTheDocument()
  })

  it('starts again from the first page when the sort changes', async () => {
    await render(
      <>
        <SortControl />
        <Feed />
      </>
    )
    await screen.findAllByTestId('feed-card')
    await loadMore()

    await userEvent.click(screen.getByText('sort az'))

    await waitFor(() =>
      expect(screen.getAllByTestId('feed-card')).toHaveLength(FEED_PAGE_SIZE)
    )
  })

  it('keeps what was already loaded when going back to a previous sort', async () => {
    await render(
      <>
        <SortControl />
        <Feed />
      </>
    )
    await screen.findAllByTestId('feed-card')
    await loadMore()

    await userEvent.click(screen.getByText('sort az'))
    await waitFor(() =>
      expect(screen.getAllByTestId('feed-card')).toHaveLength(FEED_PAGE_SIZE)
    )
    await userEvent.click(screen.getByText('sort melhores'))

    await waitFor(() =>
      expect(screen.getAllByTestId('feed-card')).toHaveLength(TOTAL)
    )
  })
})
