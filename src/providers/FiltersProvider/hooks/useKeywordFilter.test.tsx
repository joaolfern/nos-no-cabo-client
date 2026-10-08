import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/__mocks__/node'
import { V1_API_URL } from '@/config/env'
import { useCategoriesData } from '@/hooks/useDataHooks'
import { Providers } from '@/providers'
import { useFilters } from '@/pages/Feed/hooks/useFilters'

// The feed fetches the categories; the filters only read them.
function useFiltersOnFeed() {
  useCategoriesData()
  return useFilters()
}

function renderFilters(url = '/') {
  window.history.replaceState(null, '', url)
  return renderHook(() => useFiltersOnFeed(), { wrapper: Providers })
}

function categoryInUrl() {
  return new URLSearchParams(window.location.search).get('categoria')
}

describe('useKeywordFilter', () => {
  it('selects the category from the URL', async () => {
    const { result } = renderFilters('/?categoria=saude')

    await waitFor(() => expect(result.current.selectedKeywords).toHaveLength(1))

    const [id] = result.current.selectedKeywords
    expect(result.current.getKeywordById(id)?.name).toBe('saude')
  })

  it('ignores an unknown category', async () => {
    const { result } = renderFilters('/?categoria=nao-existe')

    await waitFor(() => expect(result.current.keywordOptions).not.toEqual([]))

    expect(result.current.selectedKeywords).toEqual([])
  })

  it('writes the selected category to the URL and clears it', async () => {
    const { result } = renderFilters()

    await waitFor(() => expect(result.current.keywordOptions).not.toEqual([]))
    const educacao = result.current.keywordOptions.find(
      (option) => option.label === 'Educação'
    )

    act(() => result.current.updateKeywords(educacao?.value ?? ''))
    expect(categoryInUrl()).toBe('educacao')

    act(() => result.current.clearKeywords())
    expect(categoryInUrl()).toBe(null)
  })

  it('lists categories in the curated order with pt-BR labels', async () => {
    const { result } = renderFilters()

    await waitFor(() => expect(result.current.keywordOptions).not.toEqual([]))

    expect(result.current.keywordOptions.map((option) => option.label)).toEqual(
      [
        'IA e IoT',
        'Educação',
        'Saúde',
        'Meio ambiente',
        'Cidades',
        'Comunidades',
        'Inclusão',
        'Trabalho',
        'Arte e Cultura',
        'Alimentação',
        'Outros',
      ]
    )
  })

  it('does not request categories outside the feed', async () => {
    const requested = vi.fn()
    server.use(
      http.get(`${V1_API_URL}/categories`, () => {
        requested()
        return HttpResponse.json({ total: 0, items: [] })
      })
    )
    window.history.replaceState(null, '', '/')
    const { result } = renderHook(() => useFilters(), { wrapper: Providers })

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(requested).not.toHaveBeenCalled()
    expect(result.current.keywordOptions).toEqual([])
  })
})
