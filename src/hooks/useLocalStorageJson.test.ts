import { act, renderHook } from '@testing-library/react'
import { useLocalStorageJson } from './useLocalStorageJson'

const KEY = 'test-json-list'
const EMPTY: string[] = []
const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

function useList() {
  return useLocalStorageJson(KEY, EMPTY, isStringList)
}

beforeEach(() => localStorage.clear())

describe('useLocalStorageJson', () => {
  it('starts from the stored value, or the initial one', () => {
    expect(renderHook(useList).result.current[0]).toEqual([])

    localStorage.setItem(KEY, JSON.stringify(['a']))
    expect(renderHook(useList).result.current[0]).toEqual(['a'])
  })

  it('falls back to the initial value for invalid or corrupt data', () => {
    localStorage.setItem(KEY, JSON.stringify([1, 2]))
    expect(renderHook(useList).result.current[0]).toEqual([])

    localStorage.setItem(KEY, '{not json')
    expect(renderHook(useList).result.current[0]).toEqual([])
  })

  it('persists updates and shares them with other hooks on the same key', () => {
    const first = renderHook(useList)
    const second = renderHook(useList)

    act(() => first.result.current[1]((current) => [...current, 'x']))

    expect(JSON.parse(localStorage.getItem(KEY) ?? '')).toEqual(['x'])
    expect(second.result.current[0]).toEqual(['x'])
  })

  it('picks up changes made in another tab', () => {
    const { result } = renderHook(useList)

    act(() => {
      localStorage.setItem(KEY, JSON.stringify(['from-other-tab']))
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: KEY,
          newValue: JSON.stringify(['from-other-tab']),
        })
      )
    })

    expect(result.current[0]).toEqual(['from-other-tab'])
  })
})
