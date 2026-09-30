import { act, renderHook } from '@testing-library/react'
import { useLocalStorageState } from './useLocalStorageState'

type Size = 'small' | 'large'
const isSize = (value: string): value is Size =>
  value === 'small' || value === 'large'

describe('useLocalStorageState', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => jest.restoreAllMocks())

  it('starts from the initial value', () => {
    const { result } = renderHook(() =>
      useLocalStorageState<Size>('size', 'small', isSize)
    )

    expect(result.current[0]).toBe('small')
  })

  it('restores a stored value', () => {
    localStorage.setItem('size', 'large')

    const { result } = renderHook(() =>
      useLocalStorageState<Size>('size', 'small', isSize)
    )

    expect(result.current[0]).toBe('large')
  })

  it('ignores a stored value that is not valid', () => {
    localStorage.setItem('size', 'huge')

    const { result } = renderHook(() =>
      useLocalStorageState<Size>('size', 'small', isSize)
    )

    expect(result.current[0]).toBe('small')
  })

  it('persists updates', () => {
    const { result } = renderHook(() =>
      useLocalStorageState<Size>('size', 'small', isSize)
    )

    act(() => result.current[1]('large'))

    expect(result.current[0]).toBe('large')
    expect(localStorage.getItem('size')).toBe('large')
  })

  it('keeps working in memory when storage throws', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    const { result } = renderHook(() =>
      useLocalStorageState<Size>('size', 'small', isSize)
    )
    act(() => result.current[1]('large'))

    expect(result.current[0]).toBe('large')
  })
})
