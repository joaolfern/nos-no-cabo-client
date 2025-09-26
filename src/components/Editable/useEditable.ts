import { useEffect, useReducer, useState } from 'react'

interface UseEditableProps<T> {
  value: T
}

const reducer = (_: boolean, isEditing: boolean = true) => isEditing

export function useEditable<T>({ value }: UseEditableProps<T>) {
  const [currentValue, setCurrentValue] = useState(value)
  const [isEditing, setIsEditing] = useReducer(reducer, false)

  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  return {
    currentValue,
    setCurrentValue,
    isEditing,
    setIsEditing,
  }
}
