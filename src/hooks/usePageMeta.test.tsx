import { renderHook } from '@testing-library/react'
import { DEFAULT_DESCRIPTION, usePageMeta } from '@/hooks/usePageMeta'

const content = (selector: string) =>
  document.head.querySelector(selector)?.getAttribute('content')

describe('usePageMeta', () => {
  it('sets the title, description, canonical and share tags of a page', () => {
    renderHook(() =>
      usePageMeta({
        title: 'Querido Diário',
        description: 'Diários oficiais abertos.',
        path: '/website/01ABC',
      })
    )

    expect(document.title).toBe('Querido Diário · Nós no Cabo')
    expect(content('meta[name="description"]')).toBe(
      'Diários oficiais abertos.'
    )
    expect(content('meta[property="og:title"]')).toBe(
      'Querido Diário · Nós no Cabo'
    )
    expect(content('meta[property="og:description"]')).toBe(
      'Diários oficiais abertos.'
    )
    expect(content('meta[property="og:url"]')).toBe(
      'https://nosnocabo.pages.dev/website/01ABC'
    )
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')
    ).toBe('https://nosnocabo.pages.dev/website/01ABC')
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull()
  })

  it('falls back to the site name and default description', () => {
    renderHook(() => usePageMeta({ path: '/' }))

    expect(document.title).toBe('Nós no Cabo')
    expect(content('meta[name="description"]')).toBe(DEFAULT_DESCRIPTION)
  })

  it('keeps one tag of each kind across pages, and drops noindex when leaving', () => {
    const { rerender, unmount } = renderHook((props) => usePageMeta(props), {
      initialProps: {
        title: 'Página não encontrada',
        path: '/x',
        noIndex: true,
      },
    })
    expect(content('meta[name="robots"]')).toBe('noindex')

    rerender({ title: 'Termos de uso', path: '/termos', noIndex: false })
    expect(
      document.head.querySelectorAll('meta[name="description"]')
    ).toHaveLength(1)
    expect(document.head.querySelectorAll('title')).toHaveLength(1)
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull()

    unmount()
  })
})
