import { render } from '@/__tests__/utils.test'
import { Feed } from '@/pages/Feed/Feed'
import { useFilters } from '@/pages/Feed/hooks/useFilters'
import { FEED_PAGE_SIZE } from '@/constants/post'
import { MOCK_WEBSITES } from '@/__mocks__/data/websites'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// The search box lives in the layout, so the test drives the same state.
function SearchControl() {
  const { updateSearch } = useFilters()

  return (
    <>
      <button onClick={() => updateSearch(' ')}>trigger search</button>
      <button onClick={() => updateSearch('')}>clear search</button>
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

  it('goes back to the first batch when the filters change', async () => {
    await render(
      <>
        <SearchControl />
        <Feed />
      </>
    )
    await screen.findAllByTestId('feed-card')
    await loadMore()

    // A blank-looking search still matches everything, so the full list would
    // stay valid; only the change of filters can send it back to one batch.
    await userEvent.click(screen.getByText('trigger search'))

    await waitFor(() =>
      expect(screen.getAllByTestId('feed-card')).toHaveLength(FEED_PAGE_SIZE)
    )
  })

  it('resets even when a filter change round-trips to a key seen before', async () => {
    await render(
      <>
        <SearchControl />
        <Feed />
      </>
    )
    await screen.findAllByTestId('feed-card')
    await loadMore()

    // Applying a filter and undoing it lands back on the exact filter state
    // the full list was loaded under (empty search), which must still send
    // the list back to one batch rather than silently keeping everything.
    await userEvent.click(screen.getByText('trigger search'))
    await waitFor(() =>
      expect(screen.getAllByTestId('feed-card')).toHaveLength(FEED_PAGE_SIZE)
    )
    await loadMore()
    await userEvent.click(screen.getByText('clear search'))

    await waitFor(() =>
      expect(screen.getAllByTestId('feed-card')).toHaveLength(FEED_PAGE_SIZE)
    )
  })
})
